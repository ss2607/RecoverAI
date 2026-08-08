const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Claim = require('../models/Claim');
const notificationService = require('./notificationService');
const ApiError = require('../utils/apiError');

const getOrCreateConversation = async (claimId, userId, userRole) => {
  const claim = await Claim.findById(claimId).populate('item');
  if (!claim) {
    throw new ApiError(404, 'Claim not found');
  }

  if (claim.status !== 'approved') {
    throw new ApiError(403, 'Chat is locked until the claim is approved');
  }

  const isClaimant = claim.claimant.toString() === userId.toString();
  const isOwner = claim.item.reportedBy.toString() === userId.toString();
  const isAdmin = userRole === 'admin' || userRole === 'staff';

  if (!isClaimant && !isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to access secure messaging for this claim');
  }

  let conversation = await Conversation.findOne({ claim: claimId })
    .populate('owner', 'name email')
    .populate('claimant', 'name email')
    .populate('item');

  if (!conversation) {
    conversation = await Conversation.create({
      claim: claimId,
      item: claim.item._id,
      owner: claim.item.reportedBy,
      claimant: claim.claimant,
      meetingStatus: 'awaiting_meeting'
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('owner', 'name email')
      .populate('claimant', 'name email')
      .populate('item');
  }

  return conversation;
};

const getMessages = async (conversationId, userId, userRole) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isClaimant = conversation.claimant.toString() === userId.toString();
  const isOwner = conversation.owner.toString() === userId.toString();
  const isAdmin = userRole === 'admin' || userRole === 'staff';

  if (!isClaimant && !isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to view messages in this conversation');
  }

  const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

  // Mark other sender's messages as read
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, read: false },
    { $set: { read: true } }
  );

  // Reset unread count for current user
  if (isOwner) {
    conversation.unreadCountOwner = 0;
  } else if (isClaimant) {
    conversation.unreadCountClaimant = 0;
  }
  await conversation.save();

  return messages;
};

const sendMessage = async (conversationId, senderId, text, imageUrl = '', isSystem = false) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const claimantId = conversation.claimant._id || conversation.claimant;
  const ownerId = conversation.owner._id || conversation.owner;
  const isClaimant = claimantId.toString() === senderId.toString();
  const isOwner = ownerId.toString() === senderId.toString();

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text,
    imageUrl,
    isSystem
  });

  // Update conversation caching
  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();

  // Increment unread count for recipient
  if (isOwner) {
    conversation.unreadCountClaimant += 1;
    // Notify claimant
    await notificationService.createNotification(
      claimantId,
      `Item owner: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
      'chat',
      conversation.claim
    );
  } else if (isClaimant) {
    conversation.unreadCountOwner += 1;
    // Notify owner
    await notificationService.createNotification(
      ownerId,
      `Claimant: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
      'chat',
      conversation.claim
    );
  }

  await conversation.save();
  return message;
};

const updateMeetingDetails = async (conversationId, userId, userRole, location, time, status) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isClaimant = conversation.claimant.toString() === userId.toString();
  const isOwner = conversation.owner.toString() === userId.toString();
  const isAdmin = userRole === 'admin' || userRole === 'staff';

  if (!isClaimant && !isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to update meeting details');
  }

  if (location !== undefined) conversation.meetingLocation = location;
  if (time !== undefined) conversation.meetingTime = time;
  if (status !== undefined) conversation.meetingStatus = status;

  await conversation.save();

  // Post system update message
  let updateText = 'System: Meeting details updated.';
  if (status === 'scheduled') {
    updateText = `📍 Meeting Scheduled!\nLocation: ${location}\nTime: ${time}`;
  } else if (status === 'completed') {
    updateText = '✅ Exchange completed and item returned!';
  } else if (status === 'awaiting_meeting') {
    updateText = '🔄 Meeting proposal reset.';
  }

  const systemMsg = await sendMessage(conversationId, userId, updateText, '', true);

  return { conversation, systemMsg };
};

const getUserConversations = async (userId) => {
  return await Conversation.find({
    $or: [{ owner: userId }, { claimant: userId }]
  })
  .populate('owner', 'name email')
  .populate('claimant', 'name email')
  .populate('item')
  .populate('claim')
  .sort({ lastMessageAt: -1 });
};

const getConversationById = async (conversationId, userId, userRole) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('owner', 'name email')
    .populate('claimant', 'name email')
    .populate('item')
    .populate('claim');

  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }

  const isClaimant = conversation.claimant._id.toString() === userId.toString();
  const isOwner = conversation.owner._id.toString() === userId.toString();
  const isAdmin = userRole === 'admin' || userRole === 'staff';

  if (!isClaimant && !isOwner && !isAdmin) {
    throw new ApiError(403, 'Not authorized to view this conversation');
  }

  return conversation;
};

module.exports = {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  updateMeetingDetails,
  getUserConversations,
  getConversationById
};
