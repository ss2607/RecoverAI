const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', conversationController.getOrCreateConversation);
router.get('/', conversationController.getUserConversations);
router.get('/:id', conversationController.getConversationById);
router.get('/:id/messages', conversationController.getMessages);
router.post('/:id/messages', conversationController.sendMessage);
router.put('/:id/meeting', conversationController.updateMeetingDetails);

module.exports = router;
