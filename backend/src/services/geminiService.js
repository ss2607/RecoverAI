const ai = require("../config/gemini");
const axios = require("axios");
const ApiError = require("../utils/apiError");

const analyzeImage = async (imageUrl) => {
  try {
    // Download the uploaded image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const mimeType =
      response.headers["content-type"] || "image/jpeg";

    const imageBase64 = Buffer.from(response.data).toString("base64");

    const prompt = `
Analyze this image of a lost or found item.

Return ONLY valid JSON in this exact format:

{
  "category": "",
  "color": "",
  "brand": "",
  "condition": "",
  "tags": []
}
`;

    // Send image to Gemini
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    // Extract response text
    const text =
      typeof result.text === "function"
        ? result.text()
        : result.text;

    // Remove markdown if Gemini wraps the JSON
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    return {
      category: parsed.category || "",
      color: parsed.color || "",
      brand: parsed.brand || "",
      condition: parsed.condition || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch (err) {
    console.error("Gemini Error:", err.message);

    throw new ApiError(
      550,
      "Failed to analyze image with AI"
    );
  }
};

const generateVerificationQuestions = async (item) => {
  try {
    const prompt = `
Generate exactly 5 verification questions to ask a claimant who claims to own this item.
The questions should verify their ownership based on these item details:
Title: ${item.title}
Description: ${item.description}
Category: ${item.category}
AI Tags: ${(item.aiTags || []).join(', ')}
Image URL: ${item.images?.[0] || ''}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ]
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const text = typeof result.text === "function" ? result.text() : result.text;
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      questions: Array.isArray(parsed.questions) ? parsed.questions : []
    };
  } catch (err) {
    console.error("Gemini Error:", err.message);
    throw new ApiError(500, "Failed to generate verification questions with AI");
  }
};

module.exports = {
  analyzeImage,
  generateVerificationQuestions,
};