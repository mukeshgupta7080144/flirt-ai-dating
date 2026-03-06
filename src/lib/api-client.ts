// src/lib/api-client.ts

// ✅ FIX: असली Vercel लिंक ताकि APK इंटरनेट से जुड़ सके
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://flirt-ai-dating.vercel.app";

// 🔐 FIX: Quotes हटा दिए गए हैं, अब यह .env या Vercel से असली चाबी उठाएगा!
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET_KEY; 

export async function callAI(flow: string, payload: any = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_SECRET || "", // 👈 अब यहाँ असली SUPER_SECRET_KEY जाएगी
      },
      body: JSON.stringify({ flow, payload }),
    });

    const text = await response.text();
    
    if (!text) {
      throw new Error(`Server Error: No response received (Status: ${response.status})`);
    }

    // HTML रिस्पॉन्स चेक (Vercel Errors के लिए)
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        console.error("Vercel returned HTML instead of JSON:", text.substring(0, 100));
        throw new Error("Server Error: API is not responding correctly.");
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