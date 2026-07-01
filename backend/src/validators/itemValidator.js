const { body } = require('express-validator');

const createItemValidator = [
  body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('dateLostFound').isISO8601().toDate().withMessage('Valid date is required'),
  body('status').optional().isIn(['open', 'matched', 'claimed', 'returned', 'closed']).withMessage('Invalid status')
];

const updateItemValidator = [
  body('type').optional().isIn(['lost', 'found']).withMessage('Type must be lost or found'),
  body('status').optional().isIn(['open', 'matched', 'claimed', 'returned', 'closed']).withMessage('Invalid status'),
  body('dateLostFound').optional().isISO8601().toDate().withMessage('Valid date is required')
];

module.exports = {
  createItemValidator,
  updateItemValidator
};
