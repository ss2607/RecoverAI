const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

router.use(protect);

const { apiResponse } = require('../utils/apiResponse');

// Middleware to catch multer errors
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json(apiResponse(false, 'File is too large. Max size is 5MB.'));
      }
      return res.status(400).json(apiResponse(false, err.message));
    } else if (err) {
      return res.status(400).json(apiResponse(false, err.message));
    }
    next();
  });
};

router.post('/image', uploadMiddleware, uploadController.uploadImage);

module.exports = router;
