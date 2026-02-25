const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getNewLineAction(): Promise<{ line?: string; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'newLine' }), // Backend ke 'newLine' case ko call karega
    });

    const text = await response.text();
    if (!text) throw new Error("Vercel se khali response mila.");

    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    // Backend se humne 'line' naam ki chabi (key) bheji hai
    return { line: result.line }; 

  } catch (error: any) {
    console.error("getNewLineAction Error:", error.message);
    return { error: error.message };
  }
}