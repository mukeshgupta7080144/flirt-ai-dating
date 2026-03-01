const API_URL = 'https://flirt-ai-dating.vercel.app';
// 🔐 चाबी (Password) यहाँ डिफाइन करें
const API_SECRET = 'SUPER_SECRET_KEY'; 

/**
 * Helper function to handle API calls with error checking
 */
async function fetchFromApi(flow: string, payload?: any) {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_SECRET // 👈 यह लाइन जोड़ना सबसे ज़रूरी था
        },
        body: JSON.stringify({ flow, payload }),
    });

    const text = await response.text();

    // Check for empty response from Vercel
    if (!text) {
        throw new Error(`Vercel Error! Status Code: ${response.status}. Khali response mila.`);
    }

    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || `API call for ${flow} failed`);
    }
    
    return result;
}

/**
 * The specific action for the "Refresh Karo" button
 */
export async function refreshAllLinesAction() {
    try {
        // This triggers the full generation of 25+ lines for all categories
        const data = await fetchFromApi('allNewLines');
        return { data: data.result }; // ✅ data.result रिटर्न करना बेहतर है
    } catch (error: any) {
        console.error("refreshAllLinesAction Error:", error.message);
        return { error: error.message };
    }
}