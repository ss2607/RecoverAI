const Item = require('../models/Item');
const { apiError } = require('../utils/apiError'); 
const matchingService = require('./matchingService');

const createItem = async (itemData) => {
  const item = new Item(itemData);
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
