const genAI = require('../config/gemini');
const VerificationQuestion = require('../models/VerificationQuestion');
const Item = require('../models/Item');
const { apiError } = require('../utils/apiError');

const generateQuestionsForItem = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new apiError('Item not found', 404);
  }

  await VerificationQuestion.deleteMany({ item: itemId });

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
    Generate 3 to 5 verification questions to ask a user who claims to own this item.
    The questions should verify their ownership based on the following item details:
    Description: ${item.description}
    AI Tags: ${item.aiTags.join(', ')}
    Category: ${item.category}
    Color: ${item.color}
    Brand: ${item.brand}

    Format the response as a valid JSON array of objects, where each object has 'question' and 'expectedAnswer' fields. Do not include markdown blocks.
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResult = result.response.text();
    const cleanedText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    const questionsData = JSON.parse(cleanedText);

    const questionsToInsert = questionsData.map(q => ({
      item: itemId,
      question: q.question,
      expectedAnswer: q.expectedAnswer
    }));

    const savedQuestions = await VerificationQuestion.insertMany(questionsToInsert);
    return savedQuestions;
  } catch (error) {
    console.error('Failed to generate verification questions:', error);
    throw new apiError('Failed to generate verification questions', 500);
  }
};

const getQuestionsForItem = async (itemId) => {
  const questions = await VerificationQuestion.find({ item: itemId }).select('-expectedAnswer');
  return questions;
};

const calculateVerificationScore = async (claimId, answers) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  let scoreSum = 0;

  for (const ans of answers) {
    const questionDoc = await VerificationQuestion.findById(ans.questionId);
    if (!questionDoc) continue;

    const prompt = `
      Question: ${questionDoc.question}
      Expected Answer: ${questionDoc.expectedAnswer}
      User's Answer: ${ans.answer}
      
      Score the user's answer from 0 to 100 based on how well it matches the expected answer or demonstrates knowledge.
      Return ONLY the numerical score.
    `;

    try {
      const result = await model.generateContent(prompt);
      const scoreStr = result.response.text().trim();
      const score = parseInt(scoreStr, 10) || 0;
      scoreSum += Math.min(100, Math.max(0, score));
    } catch (e) {
      console.error('Score calculation error', e);
    }
  }

  const averageScore = answers.length > 0 ? Math.round(scoreSum / answers.length) : 0;
  return averageScore;
};

module.exports = {
  generateQuestionsForItem,
  getQuestionsForItem,
  calculateVerificationScore
};
