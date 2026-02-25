import { type SmartCommentOutput } from "@/ai/flows/comment-generator";
import { z } from "zod";

const CommentSchema = z.object({
  photoDescription: z.string().min(10, "Please provide a more detailed description (at least 10 characters)."),
  language: z.enum(['hi', 'en']),
});

const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getCommentAction(data: { photoDescription: string; language: 'hi' | 'en' }): Promise<{ result?: SmartCommentOutput; error?: string | object }> {

  const validatedFields = CommentSchema.safeParse(data);

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
            flow: 'comment',
            payload: validatedFields.data
        })
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

    return { result };

  } catch (error: any) {
    console.error("getCommentAction Error:", error.message);
    return { error: error.message };
  }
}