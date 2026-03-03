// src/lib/api-client.ts

// ✅ FIX: यहाँ खाली "" की जगह हमने आपका पक्का Vercel लिंक डाल दिया है। 
// अब APK हमेशा इंटरनेट वाले असली सर्वर से ही बात करेगा!
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://flirt-ai-app.vercel.app";

// 🔐 आपका मास्टर पासवर्ड (Backend और Frontend दोनों में सेम होना चाहिए)
const API_SECRET = "SUPER_SECRET_KEY"; 

export async function callAI(flow: string, payload: any = {}) {
  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_SECRET, // 👈 चाबी यहाँ ऑटोमैटिकली जा रही है
      },
      body: JSON.stringify({ flow, payload }),
    });

    const text = await response.text();
    
    // अगर Vercel से खाली रिस्पॉन्स मिले
    if (!text) {
      throw new Error(`Server Error: No response received (Status: ${response.status})`);
    }

    // ✅ FIX: अगर Vercel गलती से JSON की जगह HTML (<!DOCTYPE) भेज दे, 
    // तो उसे यहीं पकड़ लो ताकि ऐप में वह गंदा लाल एरर न दिखे!
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        console.error("Vercel ne JSON ki jagah HTML bhej diya:", text.substring(0, 100));
        throw new Error("Server par kuchh gadbad hai. API thik se load nahi hui.");
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