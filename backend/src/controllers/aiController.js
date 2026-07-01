const geminiService = require('../services/geminiService');
const { apiResponse } = require('../utils/apiResponse');

const analyzeImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json(apiResponse(false, 'Image URL is required'));
    }

    const data = await geminiService.analyzeImage(imageUrl);

    return res.status(200).json(apiResponse(true, 'Image analyzed successfully', data));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeImage
};
