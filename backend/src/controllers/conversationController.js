const conversationService = require('../services/conversationService');
const ApiResponse = require('../utils/apiResponse');

const getOrCreateConversation = async (req, res, next) => {
  try {
    const { claimId } = req.body;
    if (!claimId) {
      return res.status(400).json(new ApiResponse(400, null, 'Claim ID is required'));
    }
    const conversation = await conversationService.getOrCreateConversation(claimId, req.user.id, req.user.role);
    return res.status(200).json(new ApiResponse(200, conversation, 'Conversation loaded successfully'));
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await conversationService.getMessages(req.params.id, req.user.id, req.user.role);
    return res.status(200).json(new ApiResponse(200, messages, 'Messages retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { text, imageUrl } = req.body;
    if (!text && !imageUrl) {
      return res.status(400).json(new ApiResponse(400, null, 'Message text or image is required'));
    }
    const message = await conversationService.sendMessage(req.params.id, req.user.id, text, imageUrl, false);
    return res.status(201).json(new ApiResponse(201, message, 'Message sent successfully'));
  } catch (error) {
    next(error);
  }
};

const updateMeetingDetails = async (req, res, next) => {
  try {
    const { location, time, status } = req.body;
    const result = await conversationService.updateMeetingDetails(req.params.id, req.user.id, req.user.role, location, time, status);
    return res.status(200).json(new ApiResponse(200, result, 'Meeting details updated successfully'));
  } catch (error) {
    next(error);
  }
};

const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.getUserConversations(req.user.id);
    return res.status(200).json(new ApiResponse(200, conversations, 'Conversations retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.id, req.user.id, req.user.role);
    return res.status(200).json(new ApiResponse(200, conversation, 'Conversation retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  updateMeetingDetails,
  getUserConversations,
  getConversationById
};
