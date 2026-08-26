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
Write a concise, natural Lost & Found description (30–50 words). Mention only information visible in the image (item type, color, visible condition, unique visible characteristics). Do NOT invent missing information.

Return ONLY valid JSON in this exact format:

{
  "category": "",
  "color": "",
  "brand": "",
  "condition": "",
  "description": "",
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
      description: parsed.description || "",
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
Generate between 2 and 5 specific verification questions to ask a claimant who claims to own this item.
These questions must prove that the claimant genuinely knows identifying physical details about the lost/found item without asking for sensitive secrets.

Item details:
Title: ${item.title}
Description: ${item.description}
Category: ${item.category}
Color: ${item.color || 'unspecified'}
Brand: ${item.brand || 'unspecified'}
AI Tags: ${(item.aiTags || []).join(', ')}
Images: ${(item.images || []).join(', ')}

CRITICAL SECURITY AND PRIVACY RULES:
1. NEVER generate verification questions that ask for:
   - PINs, passcodes, passwords, unlock patterns
   - OTPs, security answers
   - Banking credentials, account credentials
   - Any other secret/private authentication information
2. Questions should be based on physical characteristics that a legitimate owner could reasonably know about the physical item:
   - Brand, model, approximate size, color, pattern, material
   - Case/bag, protective cover color/type
   - Distinctive marks: scratches, cracks, stickers, engravings, distinctive logos/accessories/keychains
   - Physical layout: number of visible cameras on the back, location of fingerprint sensor, keyboard layout, ports
   - Contents of the item (e.g., inside a bag/wallet) described in description/tags without requesting sensitive numbers
3. Do NOT force a fixed count of 5 questions. Generate only as many meaningful questions as the item information can support (minimum 2, maximum 5).
4. Never create filler questions. Every question must have a clear relationship to the specific item.
5. Avoid questions whose answers are obvious from the public item title.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    "Question 1?",
    "Question 2?"
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