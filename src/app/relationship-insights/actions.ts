import { type RelationshipCoachOutput } from "@/ai/flows/relationship-coach";
import { z } from "zod";

const InsightsSchema = z.object({
  relationshipDescription: z.string().min(1, "Please enter a description."),
  language: z.enum(['hi', 'en']),
});

type Language = 'hi' | 'en';

const API_URL = 'https://flirt-ai-dating.vercel.app';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            flow: 'relationship',
            payload: validatedFields.data
        })
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    return { result };
  } catch (error: any) {
    console.error("getRelationshipAdvice Error:", error.message);
    return { error: error.message };
  }
}
