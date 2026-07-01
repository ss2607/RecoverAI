const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.post('/', adminOnly, notificationController.createNotification);

module.exports = router;
