const itemService = require('../services/itemService');
const { apiResponse } = require('../utils/apiResponse');
const { validationResult } = require('express-validator');

const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(apiResponse(false, 'Validation failed', errors.array()));
    }
    
    const itemData = {
      ...req.body,
      reportedBy: req.user._id 
    };
    
    const item = await itemService.createItem(itemData);
    return res.status(201).json(apiResponse(true, 'Item created successfully', item));
  } catch (error) {
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const query = req.query;
    const items = await itemService.getItems(query);
    return res.status(200).json(apiResponse(true, 'Items retrieved successfully', items));
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    return res.status(200).json(apiResponse(true, 'Item retrieved successfully', item));
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(apiResponse(false, 'Validation failed', errors.array()));
    }
    
    const item = await itemService.updateItem(req.params.id, req.user._id, req.user.role, req.body);
    return res.status(200).json(apiResponse(true, 'Item updated successfully', item));
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await itemService.deleteItem(req.params.id, req.user._id, req.user.role);
    return res.status(200).json(apiResponse(true, 'Item deleted successfully', item));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};
