import { type RelationshipCoachOutput } from "@/ai/flows/relationship-coach";
import { z } from "zod";

const InsightsSchema = z.object({
  relationshipDescription: z.string().min(1, "Please enter a description."),
  language: z.enum(['hi', 'en']),
});

type Language = 'hi' | 'en';

const API_URL = 'https://flirt-ai-dating.vercel.app';
// 🔐 बैकएंड वाला पासवर्ड यहाँ जोड़ें
const API_SECRET = 'process.env.NEXT_PUBLIC_API_SECRET_KEY'; 

export async function getRelationshipAdvice(
  message: string,
  language: Language
): Promise<{ result?: RelationshipCoachOutput; error?: string }> {

  const validatedFields = InsightsSchema.safeParse({
    relationshipDescription: message,
    language: language,
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input. Please try again.",
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-api-key': API_SECRET // 👈 यह चाबी जोड़ना सबसे ज़रूरी है
        },
        body: JSON.stringify({
            flow: 'relationship',
            payload: validatedFields.data
        })
    });

    const text = await response.text();

    if (!text) {
        throw new Error(`Vercel Error! Status Code: ${response.status}. Khali response mila.`);
    }

    const result = JSON.parse(text);

    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    // ✅ बैकएंड से डेटा { result: { ... } } फॉर्मेट में आता है
    return { result: result.result }; 
  } catch (error: any) {
    console.error("getRelationshipAdvice Error:", error.message);
    return { error: error.message };
  }
}