const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { createItemValidator, updateItemValidator } = require('../validators/itemValidator');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createItemValidator, itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', updateItemValidator, itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
