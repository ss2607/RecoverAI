const claimService = require('../services/claimService');
const verificationService = require('../services/verificationService');
const ApiResponse = require('../utils/apiResponse');

const createClaim = async (req, res, next) => {
  try {
    const { itemId, answers } = req.body;

    if (!itemId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Item ID is required'));
    }

    const claim = await claimService.createClaim(itemId, req.user.id, answers);

    return res
      .status(201)
      .json(new ApiResponse(201, claim, 'Claim created successfully'));
  } catch (error) {
    next(error);
  }
};

const getClaims = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin' || req.user.role === 'staff'
        ? {}
        : { claimant: req.user.id };

    const claims = await claimService.getClaims(query);

    return res
      .status(200)
      .json(new ApiResponse(200, claims, 'Claims retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await claimService.getClaimById(
      req.params.id,
      req.user.id,
      req.user.role
    );

    return res
      .status(200)
      .json(new ApiResponse(200, claim, 'Claim retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getClaimsByItemId = async (req, res, next) => {
  try {
    const claims = await claimService.getClaimsByItemId(
      req.params.itemId,
      req.user.id,
      req.user.role
    );

    return res
      .status(200)
      .json(new ApiResponse(200, claims, 'Item claims retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const submitVerification = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, 'Answers must be an array'));
    }

    const claim = await claimService.submitVerification(
      req.params.id,
      req.user.id,
      answers
    );

    return res
      .status(200)
      .json(new ApiResponse(200, claim, 'Verification submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const reviewClaim = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected', 'needs_info'].includes(status)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            'Invalid status. Must be approved, rejected, or needs_info.'
          )
        );
    }

    const claim = await claimService.reviewClaim(
      req.params.id,
      req.user.id,
      req.user.role,
      status,
      reviewNotes
    );

    return res
      .status(200)
      .json(new ApiResponse(200, claim, 'Claim reviewed successfully'));
  } catch (error) {
    next(error);
  }
};

const confirmReturn = async (req, res, next) => {
  try {
    const claim = await claimService.confirmReturn(
      req.params.id,
      req.user.id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          claim,
          'Item returned confirmation successful'
        )
      );
  } catch (error) {
    next(error);
  }
};

const getVerificationQuestions = async (req, res, next) => {
  try {
    const questions = await verificationService.getQuestionsForItem(
      req.params.itemId
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          questions,
          'Questions retrieved successfully'
        )
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
  getClaimsByItemId,
  submitVerification,
  reviewClaim,
  confirmReturn,
  getVerificationQuestions,
};