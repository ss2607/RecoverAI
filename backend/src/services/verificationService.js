const Item = require('../models/Item');
const Claim = require('../models/Claim');
const ai = require('../config/gemini');
const { apiError } = require('../utils/apiError');

const generateQuestionsForItem = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new apiError('Item not found', 404);
  }
  // Questions are generated once during item creation now.
  return item.verificationQuestions || [];
};

const getQuestionsForItem = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new apiError('Item not found', 404);
  }
  return item.verificationQuestions || [];
};

const calculateVerificationScore = async (claimId, answers) => {
  const claim = await Claim.findById(claimId).populate('item');
  if (!claim || !claim.item) {
    return 0;
  }

  const item = claim.item;
  const questions = item.verificationQuestions || [];
  let scoreSum = 0;
  let count = 0;

  for (const ans of answers) {
    const questionDoc = questions.find(q => q._id.toString() === ans.questionId.toString());
    if (!questionDoc) continue;

    count++;
    const prompt = `
Question: ${questionDoc.question}
User's Answer: ${ans.answer}
Item Details:
Title: ${item.title}
Description: ${item.description}

Score the user's answer from 0 to 100 based on how well it shows they are the true owner of the item described above.
Return ONLY the numerical score (e.g. 85). Do not include any other text or explanation.
`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const text = typeof result.text === "function" ? result.text() : result.text;
      const scoreStr = text.trim();
      const score = parseInt(scoreStr, 10) || 0;
      scoreSum += Math.min(100, Math.max(0, score));
    } catch (e) {
      console.error('Score calculation error', e);
    }
  }

  const averageScore = count > 0 ? Math.round(scoreSum / count) : 0;
  return averageScore;
};

module.exports = {
  generateQuestionsForItem,
  getQuestionsForItem,
  calculateVerificationScore
};
