const uploadService = require('../services/uploadService');
const ApiResponse = require('../utils/apiResponse');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(400, null, 'No image file provided')
      );
    }

    const result = await uploadService.uploadImageToCloudinary(req.file.buffer);

    return res.status(200).json(
      new ApiResponse(200, result, 'Image uploaded successfully')
    );
  } catch (error) {
    if (error.message && (error.message.includes('Invalid file type') || error.message.includes('too large'))) {
      return res.status(400).json(
        new ApiResponse(400, null, error.message)
      );
    }
    next(error);
  }
};

module.exports = {
  uploadImage
};
