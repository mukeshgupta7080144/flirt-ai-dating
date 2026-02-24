const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getNewLineAction(): Promise<{ line?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'newLine' }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    return { line: result.line };
  } catch (error: any) {
    console.error("getNewLineAction Error:", error.message);
    return { error: error.message };
  }
}
