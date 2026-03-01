// src/lib/api-client.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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