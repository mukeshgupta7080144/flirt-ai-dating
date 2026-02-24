'use server';

/**
 * @fileOverview An AI flow to generate smart comments for social media posts.
 *
 * - generateSmartComment - Generates three comment suggestions (funny, respectful, short).
 * - SmartCommentInput - The input type for the flow.
 * - SmartCommentOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartCommentInputSchema = z.object({
  photoDescription: z.string().describe('A description of the photo to comment on.'),
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response ('hi' for Hindi/Hinglish, 'en' for English)."),
});
export type SmartCommentInput = z.infer<typeof SmartCommentInputSchema>;

const SmartCommentOutputSchema = z.object({
  funny: z.string().describe('A witty or humorous comment.'),
  respectful: z.string().describe('A kind and respectful compliment.'),
  short: z.string().describe('A short and sweet comment.'),
});
export type SmartCommentOutput = z.infer<typeof SmartCommentOutputSchema>;

export async function generateSmartComment(input: SmartCommentInput): Promise<SmartCommentOutput> {
  return commentGeneratorFlow(input);
}

const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational replies and shayari in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance, deep poetry (shayari), and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes (like "Laal me maal"), and reference modern Gen-Z context.
Contextual Awareness: Perfectly tailor your response to the photo description.`;

const globalSystemPrompt = `Role: You are a charismatic, smooth-talking Western dating expert for the 'Flirt AI' app.

Core Guidelines:
Vibe & Style: Generate highly clever, witty, and contextual comments in pure, modern English. Use Western Gen-Z slang where appropriate (e.g., 'W post', 'vibe is immaculate').
Classy & Cheeky: Keep it classy but with a subtly cheeky and playful edge. The goal is universal appeal for an American/European audience.
Smart & Original: Avoid cliché comments. Your replies should feel authentic, intelligent, and tailored to the photo. Use aesthetic emojis (e.g., 🔥, ✨, 👀, 🙌).`;

const prompt = ai.definePrompt({
  name: 'commentGeneratorPrompt',
  input: {schema: SmartCommentInputSchema},
  output: {schema: SmartCommentOutputSchema},
  prompt: `Your Task:
A user wants help writing a comment on their crush's post. Based on the user's description of the photo, generate three distinct comment options.

1.  A funny comment 🤣
2.  A respectful compliment 😇
3.  A short and sweet comment ✨

Photo Description: "{{{photoDescription}}}"

Return a single, valid JSON object with the three comment options under the keys "funny", "respectful", and "short".`,
});

const commentGeneratorFlow = ai.defineFlow(
  {
    name: 'commentGeneratorFlow',
    inputSchema: SmartCommentInputSchema,
    outputSchema: SmartCommentOutputSchema,
  },
  async input => {
    const systemPrompt = input.language === 'en' ? globalSystemPrompt : hindiSystemPrompt;
    const {output} = await prompt(input, { system: systemPrompt });
    return output!;
  }
);
