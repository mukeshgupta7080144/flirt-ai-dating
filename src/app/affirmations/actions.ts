import { type AllLinesOutput } from "@/ai/flows/all-lines-generator";

const API_URL = 'https://flirt-ai-dating.vercel.app';

async function fetchFromApi(flow: string, payload?: any) {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow, payload }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `API call for ${flow} failed`);
    }
    
    return result;
}

export async function getNewLineAction(): Promise<{ line?: string; error?: string }> {
  try {
    const result = await fetchFromApi('newLine');
    return { line: result.line };
  } catch (error: any) {
    console.error("getNewLineAction Error:", error.message);
    return { error: error.message };
  }
}

export async function getAllNewLinesAction(): Promise<{ result?: AllLinesOutput; error?: string }> {
  try {
    const result = await fetchFromApi('allNewLines');
    return { result };
  } catch (error: any) {
    console.error("getAllNewLinesAction Error:", error.message);
    return { error: error.message };
  }
}
