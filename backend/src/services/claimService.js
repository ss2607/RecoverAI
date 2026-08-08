const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const conversationService = require('./conversationService');
const verificationService = require('./verificationService');
const ApiError = require('../utils/apiError');

const createNotification = async (userId, type, message, relatedId) => {
  await Notification.create({
    user: userId,
    type,
    message,
    relatedId
  });
};

const createClaim = async (itemId, userId, answers) => {
  const item = await Item.findById(itemId);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  // 1. Check whether an active claim already exists for the same item and claimant.
  const activeStatuses = ['pending', 'under_review', 'approved', 'needs_info', 'completed'];
  const existingClaim = await Claim.findOne({
    item: itemId,
    claimant: userId,
    status: { $in: activeStatuses }
  });

  // 2. If an active claim exists, return an error.
  if (existingClaim) {
    throw new ApiError(
      400,
      'You have already submitted a claim for this item'
    );
  }

  // 3. Create the Claim directly with status = "under_review" and answers.
  const claim = await Claim.create({
    item: itemId,
    claimant: userId,
    answers: answers || [],
    status: 'under_review'
  });

  // Calculate and save the verification score.
  if (answers && answers.length > 0) {
    const score = await verificationService.calculateVerificationScore(claim._id, answers);
    claim.verificationScore = score;
  }

  // Update the Item status to "claim_pending".
  item.status = 'claim_pending';

  // Commit all database changes before sending notifications.
  await claim.save();
  await item.save();

  // 4. After successful save: notify owner, emit Socket.IO events, update stats.
  const populatedClaim = await Claim.findById(claim._id).populate('claimant', 'name email');
  const claimantName = populatedClaim?.claimant?.name || 'A claimant';

  await createNotification(
    item.reportedBy,
    'new_claim',
    `New claim submitted by ${claimantName} for item: ${item.title}`,
    claim._id
  );

  try {
    const { emitToUser } = require('../config/socket');
    emitToUser(item.reportedBy.toString(), 'new_claim', populatedClaim);
    emitToUser(item.reportedBy.toString(), 'stats_updated', {});
    emitToUser(userId.toString(), 'stats_updated', {});
  } catch (err) {
    console.error('Error emitting new_claim socket events:', err);
  }

  return populatedClaim;
};

const getClaims = async (query = {}) => {
  return await Claim.find(query)
    .populate('item')
    .populate('claimant', 'name email');
};

const getClaimsForUser = async (userId, role) => {
  if (role === 'admin' || role === 'staff') {
    return await getClaims();
  }

  const userItems = await Item.find({ reportedBy: userId }).select('_id');
  const userItemIds = userItems.map(item => item._id);

  return await Claim.find({
    $or: [
      { claimant: userId },
      { item: { $in: userItemIds } }
    ]
  })
  .populate('item')
  .populate('claimant', 'name email');
};

const getClaimById = async (id, userId, userRole) => {
  const claim = await Claim.findById(id)
    .populate({
      path: 'item',
      populate: { path: 'reportedBy', select: 'name email' }
    })
    .populate('claimant', 'name email')
    .populate('reviewedBy', 'name');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  const claimantId = claim.claimant?._id || claim.claimant;
  const itemOwnerId = claim.item?.reportedBy?._id || claim.item?.reportedBy;

  const isClaimant = claimantId && claimantId.toString() === userId.toString();
  const isOwner = itemOwnerId && itemOwnerId.toString() === userId.toString();
  const isAdmin = userRole === 'admin' || userRole === 'staff';

  if (!isClaimant && !isOwner && !isAdmin) {
    throw new ApiError(
      403,
      'Not authorized to view this claim'
    );
  }

  return claim;
};

const getClaimsByItemId = async (
  itemId,
  userId,
  userRole
) => {
  const item = await Item.findById(itemId);

  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (
    item.reportedBy.toString() !== userId.toString() &&
    userRole !== 'admin' &&
    userRole !== 'staff'
  ) {
    throw new ApiError(
      403,
      'Not authorized to view claims for this item'
    );
  }

  return await Claim.find({
    item: itemId
  }).populate('claimant', 'name email');
};

const submitVerification = async (
  id,
  userId,
  answers
) => {
  const claim = await Claim.findById(id)
    .populate('item claimant');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  if (claim.claimant._id.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      'Not authorized to verify this claim'
    );
  }

  const score =
    await verificationService.calculateVerificationScore(
      id,
      answers
    );

  claim.answers = answers;
  claim.verificationScore = score;
  claim.status = 'under_review';

  await claim.save();

  if (claim.item) {
    claim.item.status = 'claim_pending';
    await claim.item.save();

    const ownerId = claim.item.reportedBy;
    const claimantName =
      claim.claimant.name || 'A claimant';

    await createNotification(
      ownerId,
      'new_claim',
      `New claim submitted by ${claimantName} for item: ${claim.item.title}`,
      claim._id
    );

    try {
      const { emitToUser } = require('../config/socket');

      emitToUser(
        ownerId.toString(),
        'new_claim',
        claim
      );

      emitToUser(
        ownerId.toString(),
        'stats_updated',
        {}
      );

      emitToUser(
        userId.toString(),
        'stats_updated',
        {}
      );
    } catch (err) {
      console.error(
        'Error emitting new_claim socket events:',
        err
      );
    }
  }

  return claim;
};

const reviewClaim = async (
  id,
  userId,
  userRole,
  status,
  reviewNotes
) => {
  const claim = await Claim.findById(id)
    .populate('item claimant');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  const isOwner =
    claim.item.reportedBy.toString() ===
    userId.toString();

  const isAdminOrStaff =
    userRole === 'admin' ||
    userRole === 'staff';

  if (!isOwner && !isAdminOrStaff) {
    throw new ApiError(
      403,
      'Not authorized to review this claim'
    );
  }

  claim.status = status;
  claim.reviewedBy = userId;
  claim.reviewNotes = reviewNotes;

  await claim.save();

  if (status === 'approved') {
    await createNotification(
      claim.claimant._id,
      'claim_approved',
      `Your claim for item ${claim.item.title} has been approved.`,
      claim._id
    );

    claim.item.status = 'awaiting_exchange';
    await claim.item.save();

    await Claim.updateMany(
      {
        item: claim.item._id,
        _id: { $ne: claim._id }
      },
      {
        status: 'rejected',
        reviewNotes:
          'Item was claimed by another user.'
      }
    );
  } else if (status === 'rejected') {
    await createNotification(
      claim.claimant._id,
      'claim_rejected',
      `Your claim for item ${claim.item.title} has been rejected.`,
      claim._id
    );
  } else if (status === 'needs_info') {
    await createNotification(
      claim.claimant._id,
      'needs_info',
      `More information requested for your claim on item: ${claim.item.title}`,
      claim._id
    );
  }

  try {
    const { emitToUser } = require('../config/socket');

    const ownerId = claim.item.reportedBy;
    const claimantId =
      claim.claimant._id || claim.claimant;

    emitToUser(
      claimantId.toString(),
      `claim_${status}`,
      claim
    );

    emitToUser(
      claimantId.toString(),
      'stats_updated',
      {}
    );

    emitToUser(
      ownerId.toString(),
      'stats_updated',
      {}
    );
  } catch (err) {
    console.error(
      'Error emitting review socket events:',
      err
    );
  }

  return claim;
};

const confirmReturn = async (
  id,
  userId
) => {
  const claim = await Claim.findById(id)
    .populate('item');

  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  if (claim.item.status !== 'awaiting_exchange') {
    throw new ApiError(
      400,
      'Item is not awaiting exchange'
    );
  }

  const isClaimant =
    claim.claimant.toString() ===
    userId.toString();

  const isOwner =
    claim.item.reportedBy.toString() ===
    userId.toString();

  if (!isClaimant && !isOwner) {
    throw new ApiError(
      403,
      'Not authorized to confirm return'
    );
  }

  // Update confirmation flags
  if (isOwner) {
    claim.ownerConfirmedReturn = true;
  }
  if (isClaimant) {
    claim.claimantConfirmedReturn = true;
  }

  const bothConfirmed = claim.ownerConfirmedReturn && claim.claimantConfirmedReturn;

  if (bothConfirmed) {
    claim.status = 'completed';
    claim.item.status = 'returned';
    await claim.item.save();
  }

  await claim.save();

  // Find the conversation to send system message and trigger socket updates
  const conversation = await Conversation.findOne({ claim: claim._id });
  if (conversation) {
    if (bothConfirmed) {
      conversation.meetingStatus = 'completed';
      await conversation.save();

      // Automatically generate a system message
      await conversationService.sendMessage(
        conversation._id,
        userId,
        "✅ Exchange completed successfully.\n\nOwner confirmed return.\nClaimant confirmed return.\n\nThe item has been marked as returned.\n\nConversation archived.",
        '',
        true
      );
    }

    try {
      const { emitToUser } = require('../config/socket');
      const Message = require('../models/Message');

      const ownerId = claim.item.reportedBy.toString();
      const claimantId = (claim.claimant._id || claim.claimant).toString();

      // Emit meeting_updated to both users to trigger reload of conversation
      emitToUser(ownerId, 'meeting_updated', { conversationId: conversation._id });
      emitToUser(claimantId, 'meeting_updated', { conversationId: conversation._id });

      if (bothConfirmed) {
        emitToUser(claimantId, 'item_returned', claim);
        emitToUser(ownerId, 'item_returned', claim);
        emitToUser(claimantId, 'stats_updated', {});
        emitToUser(ownerId, 'stats_updated', {});

        // Emit receive_message event so the system message appears instantly
        const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(1);
        if (messages.length > 0) {
          emitToUser(claimantId, 'receive_message', { conversationId: conversation._id, message: messages[0] });
          emitToUser(ownerId, 'receive_message', { conversationId: conversation._id, message: messages[0] });
        }
      }
    } catch (err) {
      console.error('Error emitting confirm return socket events:', err);
    }
  }

  if (bothConfirmed) {
    await createNotification(
      claim.claimant,
      'item_returned',
      `Exchange confirmed: item ${claim.item.title} has been successfully returned.`,
      claim._id
    );

    await createNotification(
      claim.item.reportedBy,
      'item_returned',
      `Exchange confirmed: item ${claim.item.title} has been successfully returned.`,
      claim._id
    );
  }

  return claim;
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
  getClaimsByItemId,
  submitVerification,
  reviewClaim,
  confirmReturn,
  getClaimsForUser
};