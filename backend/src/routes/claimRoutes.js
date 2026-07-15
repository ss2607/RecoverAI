const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', claimController.createClaim);
router.get('/', claimController.getClaims);
router.get('/:id', claimController.getClaimById);
router.put('/:id/review', claimController.reviewClaim);
router.post('/:id/verify', claimController.submitVerification);
router.post('/:id/confirm-return', claimController.confirmReturn);
router.get('/item/:itemId', claimController.getClaimsByItemId);
router.get('/item/:itemId/questions', claimController.getVerificationQuestions);

module.exports = router;
