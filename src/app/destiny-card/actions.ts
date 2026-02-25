import { type GenerateReplyOutput } from "@/ai/flows/reply-generator";
import { z } from "zod";

const ReplySchema = z.object({
  lastMessage: z.string().min(1, "Please enter a message."),
  language: z.enum(['hi', 'en']),
});

const API_URL = 'https://flirt-ai-dating.vercel.app';

export async function getReplyAction(
  message: string,
  language: 'hi' | 'en'
): Promise<{ result?: GenerateReplyOutput; error?: string }> {
    const validatedFields = ReplySchema.safeParse({
        lastMessage: message,
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
                flow: 'reply',
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
        console.error("getReplyAction Error:", error.message);
        return { error: error.message };
    }
}