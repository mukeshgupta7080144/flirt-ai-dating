// src/lib/api-client.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://flirt-ai-dating.vercel.app";

// 🔐 FIX: Quotes हटा दिए गए हैं। अब यह असली Environment Variable उठाएगा।
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET_KEY; 

export async function callAI(flow: string, payload: any = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_SECRET || "", // 👈 अब यहाँ असली चाबी जाएगी
      },
      body: JSON.stringify({ flow, payload }),
    });

    const text = await response.text();
    
    if (!text) {
      throw new Error(`Server Error: No response received (Status: ${response.status})`);
    }

    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        console.error("Vercel returned HTML instead of JSON");
        throw new Error("Server Error: API configuration issue.");
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.error || `Server Error ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error("API Client Error:", error.message);
    throw error;
  }
}