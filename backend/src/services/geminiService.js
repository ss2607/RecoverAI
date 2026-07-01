const genAI = require('../config/gemini');
const axios = require('axios');
const { apiError } = require('../utils/apiError');

const analyzeImage = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this image of a lost or found item.
      Please output the result strictly as a valid JSON object with the following fields:
      - category: A general category like Electronics, Clothing, Accessories, etc.
      - color: The dominant color(s)
      - brand: The brand name if visible, otherwise "Unknown"
      - condition: The condition of the item if discernible, otherwise "Unknown"
      - tags: An array of 3-5 descriptive tags
      Do not include any other text or markdown formatting around the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType
        }
      }
    ]);

    const textResult = result.response.text();
    let parsedData;
    
    try {
      const cleanedText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textResult);
      throw new apiError('Failed to parse AI response', 500);
    }

    return {
      category: parsedData.category || '',
      color: parsedData.color || '',
      brand: parsedData.brand || '',
      condition: parsedData.condition || '',
      tags: Array.isArray(parsedData.tags) ? parsedData.tags : []
    };
  } catch (error) {
    if (error instanceof apiError) throw error;
    console.error('Gemini API Error:', error);
    throw new apiError('Failed to analyze image with AI', 500);
  }
};

module.exports = {
  analyzeImage
};
