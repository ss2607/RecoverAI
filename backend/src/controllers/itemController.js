const itemService = require('../services/itemService');
const ApiResponse = require('../utils/apiResponse');
const matchingService = require('../services/matchingService');
const { validationResult } = require('express-validator');

const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(
        new ApiResponse(400, errors.array(), 'Validation failed')
      );
    }

    const itemData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const item = await itemService.createItem(itemData);

    return res.status(201).json(
      new ApiResponse(201, item, 'Item created successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const query = req.query;
    const items = await itemService.getItems(query);

    return res.status(200).json(
      new ApiResponse(200, items, 'Items retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, item, 'Item retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(
        new ApiResponse(400, errors.array(), 'Validation failed')
      );
    }

    const item = await itemService.updateItem(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );

    return res.status(200).json(
      new ApiResponse(200, item, 'Item updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await itemService.deleteItem(
      req.params.id,
      req.user.id,
      req.user.role
    );

    return res.status(200).json(
      new ApiResponse(200, item, 'Item deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getItemMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getItemMatches(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, matches, 'Matches retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches
};