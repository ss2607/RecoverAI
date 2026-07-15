const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const verificationService = require('./verificationService');
const { apiError } = require('../utils/apiError');

const createNotification = async (userId, type, message, relatedId) => {
  await Notification.create({ user: userId, type, message, relatedId });
};

const createClaim = async (itemId, userId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new apiError('Item not found', 404);
  }

  const existingClaim = await Claim.findOne({ item: itemId, claimant: userId });
  if (existingClaim) {
    throw new apiError('You have already submitted a claim for this item', 400);
  }

  const claim = await Claim.create({
    item: itemId,
    claimant: userId,
    status: 'pending'
  });

  const existingQuestions = await verificationService.getQuestionsForItem(itemId);
  if (existingQuestions.length === 0) {
    await verificationService.generateQuestionsForItem(itemId);
  }

  await createNotification(item.reportedBy, 'claim_submitted', `A new claim was submitted for your item: ${item.title}`, claim._id);

  return claim;
};

const getClaims = async (query = {}) => {
  return await Claim.find(query).populate('item').populate('claimant', 'name email');
};

const getClaimById = async (id, userId, userRole) => {
  const claim = await Claim.findById(id).populate('item').populate('claimant', 'name email').populate('reviewedBy', 'name');
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  if (claim.claimant._id.toString() !== userId.toString() && userRole !== 'admin' && userRole !== 'staff') {
    throw new apiError('Not authorized to view this claim', 403);
  }

  return claim;
};

const getClaimsByItemId = async (itemId, userId, userRole) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new apiError('Item not found', 404);
  }

  if (item.reportedBy.toString() !== userId.toString() && userRole !== 'admin' && userRole !== 'staff') {
    throw new apiError('Not authorized to view claims for this item', 403);
  }

  return await Claim.find({ item: itemId }).populate('claimant', 'name email');
};

const submitVerification = async (id, userId, answers) => {
  const claim = await Claim.findById(id).populate('item claimant');
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  if (claim.claimant._id.toString() !== userId.toString()) {
    throw new apiError('Not authorized to verify this claim', 403);
  }

  const score = await verificationService.calculateVerificationScore(id, answers);
  
  claim.answers = answers;
  claim.verificationScore = score;
  claim.status = 'under_review';
  
  await claim.save();

  // Update item status to claim_pending
  if (claim.item) {
    claim.item.status = 'claim_pending';
    await claim.item.save();

    // Notify the owner of the FOUND item
    const ownerId = claim.item.reportedBy;
    const claimantName = claim.claimant.name || 'A claimant';
    const itemTitle = claim.item.title;
    await createNotification(
      ownerId, 
      'new_claim', 
      `New claim submitted by ${claimantName} for item: ${itemTitle}`, 
      claim._id
    );

    // Emit Socket.IO Events
    try {
      const { emitToUser } = require('../config/socket');
      emitToUser(ownerId.toString(), 'new_claim', claim);
      emitToUser(ownerId.toString(), 'stats_updated', {});
      emitToUser(userId.toString(), 'stats_updated', {});
    } catch (err) {
      console.error('Error emitting new_claim socket events:', err);
    }
  }

  return claim;
};

const reviewClaim = async (id, userId, userRole, status, reviewNotes) => {
  const claim = await Claim.findById(id).populate('item claimant');
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  const isOwner = claim.item.reportedBy.toString() === userId.toString();
  const isAdminOrStaff = userRole === 'admin' || userRole === 'staff';

  if (!isOwner && !isAdminOrStaff) {
    throw new apiError('Not authorized to review this claim', 403);
  }

  claim.status = status;
  claim.reviewedBy = userId;
  claim.reviewNotes = reviewNotes;
  
  await claim.save();

  if (status === 'approved') {
    await createNotification(claim.claimant._id, 'claim_approved', `Your claim for item ${claim.item.title} has been approved.`, claim._id);
    
    claim.item.status = 'awaiting_exchange';
    await claim.item.save();
    
    await Claim.updateMany(
      { item: claim.item._id, _id: { $ne: claim._id } },
      { status: 'rejected', reviewNotes: 'Item was claimed by another user.' }
    );
  } else if (status === 'rejected') {
    await createNotification(claim.claimant._id, 'claim_rejected', `Your claim for item ${claim.item.title} has been rejected.`, claim._id);
  } else if (status === 'needs_info') {
    await createNotification(claim.claimant._id, 'needs_info', `More information requested for your claim on item: ${claim.item.title}`, claim._id);
  }

  // Emit Socket.IO Events
  try {
    const { emitToUser } = require('../config/socket');
    const ownerId = claim.item.reportedBy;
    const claimantId = claim.claimant._id || claim.claimant;
    
    emitToUser(claimantId.toString(), `claim_${status}`, claim);
    emitToUser(claimantId.toString(), 'stats_updated', {});
    emitToUser(ownerId.toString(), 'stats_updated', {});
  } catch (err) {
    console.error('Error emitting review socket events:', err);
  }

  return claim;
};

const confirmReturn = async (id, userId) => {
  const claim = await Claim.findById(id).populate('item');
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  if (claim.item.status !== 'awaiting_exchange') {
    throw new apiError('Item is not awaiting exchange', 400);
  }

  const isClaimant = claim.claimant.toString() === userId.toString();
  const isOwner = claim.item.reportedBy.toString() === userId.toString();

  if (!isClaimant && !isOwner) {
    throw new apiError('Not authorized to confirm return', 403);
  }

  claim.status = 'completed';
  await claim.save();

  claim.item.status = 'returned';
  await claim.item.save();

  // Create notifications
  await createNotification(claim.claimant, 'item_returned', `Exchange confirmed: item ${claim.item.title} has been successfully returned.`, claim._id);
  await createNotification(claim.item.reportedBy, 'item_returned', `Exchange confirmed: item ${claim.item.title} has been successfully returned.`, claim._id);

  // Emit Socket.IO Events
  try {
    const { emitToUser } = require('../config/socket');
    const ownerId = claim.item.reportedBy;
    const claimantId = claim.claimant._id || claim.claimant;

    emitToUser(claimantId.toString(), 'item_returned', claim);
    emitToUser(ownerId.toString(), 'item_returned', claim);

    emitToUser(claimantId.toString(), 'stats_updated', {});
    emitToUser(ownerId.toString(), 'stats_updated', {});
  } catch (err) {
    console.error('Error emitting confirm return socket events:', err);
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
  confirmReturn
};
