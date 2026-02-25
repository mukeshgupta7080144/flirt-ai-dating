const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getNewLineAction(): Promise<{ line?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'newLine' }),
    });

    // 👇 NAYA SMART CODE YAHAN HAI 👇
    const text = await response.text();

    if (!text) {
        throw new Error(`Vercel Error! Status Code: ${response.status}. Khali response mila.`);
    }

    const result = JSON.parse(text);
    // 👆 NAYA SMART CODE YAHAN TAK 👆

    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    return { line: result.line };
  } catch (error: any) {
    console.error("getNewLineAction Error:", error.message);
    return { error: error.message };
  }
}