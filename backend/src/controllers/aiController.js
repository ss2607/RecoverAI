const geminiService = require('../services/geminiService');
const ApiResponse = require('../utils/apiResponse');

const analyzeImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Image URL is required')
      );
    }

    const data = await geminiService.analyzeImage(imageUrl);

    return res.status(200).json(
      new ApiResponse(200, data, 'Image analyzed successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeImage,
};