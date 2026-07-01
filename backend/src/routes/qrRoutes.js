const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, qrController.generateLink);
router.get('/:code', qrController.scanCode);

module.exports = router;
