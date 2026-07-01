const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.get('/item/:itemId', matchController.getMatchesByItemId);
router.delete('/:id', matchController.deleteMatch);

module.exports = router;
