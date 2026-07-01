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
  const claim = await Claim.findById(id);
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  if (claim.claimant.toString() !== userId.toString()) {
    throw new apiError('Not authorized to verify this claim', 403);
  }

  const score = await verificationService.calculateVerificationScore(id, answers);
  
  claim.answers = answers;
  claim.verificationScore = score;
  claim.status = 'under_review';
  
  await claim.save();
  return claim;
};

const reviewClaim = async (id, userId, status, reviewNotes) => {
  const claim = await Claim.findById(id).populate('item');
  if (!claim) {
    throw new apiError('Claim not found', 404);
  }

  claim.status = status;
  claim.reviewedBy = userId;
  claim.reviewNotes = reviewNotes;
  
  await claim.save();

  if (status === 'approved') {
    await createNotification(claim.claimant, 'claim_approved', `Your claim for item ${claim.item.title} has been approved.`, claim._id);
    
    claim.item.status = 'claimed';
    await claim.item.save();
    
    await Claim.updateMany(
      { item: claim.item._id, _id: { $ne: claim._id } },
      { status: 'rejected', reviewNotes: 'Item was claimed by another user.' }
    );
  } else if (status === 'rejected') {
    await createNotification(claim.claimant, 'claim_rejected', `Your claim for item ${claim.item.title} has been rejected.`, claim._id);
  }

  return claim;
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
  getClaimsByItemId,
  submitVerification,
  reviewClaim
};
