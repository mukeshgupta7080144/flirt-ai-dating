import { type StoryAnalyzerOutput } from "@/ai/flows/story-analyzer";
import { z } from "zod";

const StorySchema = z.object({
  storyDescription: z.string().min(5, "Please provide a brief description of the story."),
  userDetails: z.string().optional(),
  language: z.enum(['hi', 'en']),
});

const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getStoryAnalysisAction(data: { storyDescription: string; userDetails?: string, language: 'hi' | 'en' }): Promise<{ result?: StoryAnalyzerOutput; error?: string | object }> {

  const validatedFields = StorySchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            flow: 'story',
            payload: validatedFields.data
        })
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    return { result };

  } catch (error: any) {
    console.error("getStoryAnalysisAction Error:", error.message);
    return { error: error.message };
  }
}
