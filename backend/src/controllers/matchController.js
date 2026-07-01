const matchingService = require('../services/matchingService');
const { apiResponse } = require('../utils/apiResponse');

const getMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getMatches();
    return res.status(200).json(apiResponse(true, 'Matches retrieved successfully', matches));
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const match = await matchingService.getMatchById(req.params.id);
    return res.status(200).json(apiResponse(true, 'Match retrieved successfully', match));
  } catch (error) {
    next(error);
  }
};

const getMatchesByItemId = async (req, res, next) => {
  try {
    const matches = await matchingService.getMatchesByItemId(req.params.itemId);
    return res.status(200).json(apiResponse(true, 'Item matches retrieved successfully', matches));
  } catch (error) {
    next(error);
  }
};

const deleteMatch = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json(apiResponse(false, 'Only admins can delete matches'));
    }
    const match = await matchingService.deleteMatch(req.params.id);
    return res.status(200).json(apiResponse(true, 'Match deleted successfully', match));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches,
  getMatchById,
  getMatchesByItemId,
  deleteMatch
};
