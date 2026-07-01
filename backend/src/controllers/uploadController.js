const uploadService = require('../services/uploadService');
const { apiResponse } = require('../utils/apiResponse');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(apiResponse(false, 'No image file provided'));
    }

    const result = await uploadService.uploadImageToCloudinary(req.file.buffer);

    return res.status(200).json(apiResponse(true, 'Image uploaded successfully', result));
  } catch (error) {
    if (error.message && (error.message.includes('Invalid file type') || error.message.includes('too large'))) {
       return res.status(400).json(apiResponse(false, error.message));
    }
    next(error);
  }
};

module.exports = {
  uploadImage
};
