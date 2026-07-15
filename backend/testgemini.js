const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
    try {
        const response = await ai.models.list();

        console.log(response);
    } catch (err) {
        console.error(err);
    }
}

main();