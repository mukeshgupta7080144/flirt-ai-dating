import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔐 Google Gemini API Key
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAllNewLines() {

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
You are an expert Indian dating coach and a Gen-Z relationship guru.

Generate EXACTLY 5 items for EACH category.

Language: Hinglish (Hindi + English mix).
Tone: trendy, emotional, Gen-Z friendly.
Use emojis where appropriate.

Return ONLY valid JSON with this structure:

{
  "questions": [
    { "line": "Deep or bold Hinglish question to ask a crush.", "usageTip": "Kab use karein" }
  ],
  "funnyFlirts": [
    { "line": "Funny Hinglish pickup line.", "usageTip": "Hasane ke liye" }
  ],
  "anokhiNight": [
    { "line": "Late night romantic or deep line.", "usageTip": "Raat ko use karein" }
  ],
  "damageControl": [
    { "line": "Sweet apology line.", "usageTip": "Gussa shant karne ke liye" }
  ],
  "vibeCheck": [
    { "line": "Playful teasing line.", "usageTip": "Conversation start karne ke liye" }
  ]
}
`;

  try {

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let responseText = response.text();

    if (!responseText) {
      throw new Error("AI returned empty response.");
    }

    // 🔧 Remove markdown formatting
    responseText = responseText
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .trim();

    // 🔧 Extract JSON safely
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Invalid AI response:", responseText);
      throw new Error("AI response format invalid.");
    }

    const jsonString = responseText.substring(jsonStart, jsonEnd + 1);

    const parsedData = JSON.parse(jsonString);

    return parsedData;

  } catch (error) {

    console.error("🚨 Master Generator Error:", error);

    throw new Error("Failed to generate all categories bundle.");
  }
}