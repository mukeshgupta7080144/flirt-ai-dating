const API_URL = 'https://flirt-ai-dating.vercel.app';

async function fetchFromApi(flow: string, payload?: any) {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow, payload }),
    });

    // Seedha JSON banane ke bajaye, pehle Text mein padhenge
    const text = await response.text();

    // Agar Vercel ne khali (empty) response bheja hai, toh asli error pakdenge
    if (!text) {
        throw new Error(`Vercel Error! Status Code: ${response.status}. Khali response mila.`);
    }

    // Ab text ko JSON mein badlenge (taaki Unexpected end of JSON na aaye)
    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || `API call for ${flow} failed`);
    }
    
    return result;
}