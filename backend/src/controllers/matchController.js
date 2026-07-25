const matchingService = require('../services/matchingService');
const ApiResponse = require('../utils/apiResponse');

const getMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getMatchesForUser(req.user.id, req.user.role);
    return res.status(200).json(new ApiResponse(200, matches, 'Matches retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const match = await matchingService.getMatchById(req.params.id);
    return res.status(200).json(new ApiResponse(200, match, 'Match retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getMatchesByItemId = async (req, res, next) => {
  try {
    const matches = await matchingService.getMatchesByItemId(req.params.itemId);
    return res.status(200).json(new ApiResponse(200, matches, 'Item matches retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteMatch = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json(new ApiResponse(403, null, 'Only admins can delete matches'));
    }
    const match = await matchingService.deleteMatch(req.params.id);
    return res.status(200).json(new ApiResponse(200, match, 'Match deleted successfully'));
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
