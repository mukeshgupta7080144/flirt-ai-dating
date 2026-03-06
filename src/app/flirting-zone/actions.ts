const API_URL = 'https://flirt-ai-dating.vercel.app';
// 🔐 बैकएंड वाला पासवर्ड यहाँ डालें
const API_SECRET = 'process.env.NEXT_PUBLIC_API_SECRET_KEY'; 

export async function getNewLineAction(): Promise<{ line?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_SECRET // 👈 यह चाबी जोड़ना ज़रूरी है
        },
        body: JSON.stringify({ flow: 'newLine' }), 
    });

    const text = await response.text();
    if (!text) throw new Error("Vercel se khali response mila.");

    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    // ✅ Backend का रिस्पॉन्स { result: { line: "..." } } फॉर्मेट में होता है
    return { line: result.result?.line }; 

  } catch (error: any) {
    console.error("getNewLineAction Error:", error.message);
    return { error: error.message };
  }
}