import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔐 Google Gemini API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAllNewLines() {
  // 🧠 Gemini 1.5 Flash - तेज़ और स्मार्ट मॉडल
  const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // 🔥 FIX: AI को सख्त आदेश कि सिर्फ JSON ही भेजना, फालतू बातें नहीं!
      generationConfig: { responseMimeType: "application/json" }
  });

  // 👑 The Master Prompt (AI को हमारा हुक्म)
  const prompt = `
  You are an expert Indian dating coach and a Gen-Z relationship guru. 
  Your task is to generate fresh, unique, and highly engaging Hinglish (Hindi + English) flirting lines for 5 different categories.

  Generate EXACTLY 5 highly impressive items for EACH category.
  The language must be natural, trendy, and emotional, using emojis where appropriate.

  Return ONLY a valid JSON object with this EXACT structure (No markdown, no extra text):
  {
    "questions": [ 
      { "line": "Deep or bold Hinglish question to ask a crush.", "usageTip": "Kab use karein (e.g., Night chat me)" } 
    ],
    "funnyFlirts": [ 
      { "line": "Hilarious and witty Hinglish pickup line.", "usageTip": "Hasane ke liye" } 
    ],
    "anokhiNight": [ 
      { "line": "Late night deep, romantic, or slight naughty (but safe) line.", "usageTip": "Raat ko 12 baje ke baad" } 
    ],
    "damageControl": [ 
      { "line": "Sweet apology or making-up line after a fight.", "usageTip": "Gussa shant karne ke liye" } 
    ],
    "vibeCheck": [ 
      { "line": "Playful teasing or casual vibe check line.", "usageTip": "Conversation start karne ke liye" } 
    ]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // 🛠️ X-RAY FIX: JSON Cleaner (यह AI के फालतू डिज़ाइन और मार्कडाउन को हटाकर उसे 100% शुद्ध JSON बनाएगा)
    responseText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    // 🛡️ Safe Parsing Shield: अगर AI कोई गलती करता है, तो सर्वर 500 Error देकर क्रैश नहीं होगा
    try {
        const parsedData = JSON.parse(responseText);
        return parsedData;
    } catch (parseError) {
        // Vercel Logs में देखने के लिए कि AI ने असल में क्या भेजा था
        console.error("🚨 JSON Parsing Failed! Raw Text was:", responseText);
        throw new Error("AI ne galat format bheja, please try again.");
    }

  } catch (error) {
    console.error("Master Generator Error:", error);
    throw new Error("Failed to generate all categories bundle.");
  }
}