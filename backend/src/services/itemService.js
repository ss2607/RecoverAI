const Item = require('../models/Item');
const { apiError } = require('../utils/apiError'); 
const matchingService = require('./matchingService');
const geminiService = require('./geminiService');

const createItem = async (itemData) => {
  const item = new Item(itemData);

  // Generate 5 verification questions via Gemini before saving
  try {
    const result = await geminiService.generateVerificationQuestions(item);
    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
      item.verificationQuestions = result.questions.map(q => ({ question: q }));
    } else {
      throw new Error("No questions returned from Gemini");
    }
  } catch (err) {
    console.error("Failed to pre-generate verification questions:", err);
    // Fallback ownership questions
    item.verificationQuestions = [
      { question: "Where exactly did you lose/find this item?" },
      { question: "Are there any specific engravings, scratches, or unique markings?" },
      { question: "What is the brand and color of the item?" },
      { question: "Can you confirm the approximate date and time you last saw it?" },
      { question: "Do you have any original purchase details or serial numbers?" }
    ];
  }

  await item.save();
  
  matchingService.runMatchingForItem(item).catch(err => console.error("Matching error:", err));
  
  return item;
};

const getItems = async (query = {}) => {
  const items = await Item.find(query).populate('reportedBy', 'name email').sort({ createdAt: -1 });
  return items;
};

const getItemById = async (id) => {
  const item = await Item.findById(id).populate('reportedBy', 'name email');
  if (!item) {
    throw new apiError('Item not found', 404);
  }
  return item;
};

const updateItem = async (id, userId, userRole, updateData) => {
  const item = await Item.findById(id);
  if (!item) {
    throw new apiError('Item not found', 404);
  }
  
  if (item.reportedBy.toString() !== userId.toString() && userRole !== 'admin') {
    throw new apiError('Not authorized to update this item', 403);
  }
  
  Object.assign(item, updateData);
  await item.save();
  return item;
};

const deleteItem = async (id, userId, userRole) => {
  const item = await Item.findById(id);
  if (!item) {
    throw new apiError('Item not found', 404);
  }
  
  if (item.reportedBy.toString() !== userId.toString() && userRole !== 'admin') {
    throw new apiError('Not authorized to delete this item', 403);
  }
  
  await item.deleteOne();
  return item;
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};
