'use server';

/**
 * @fileOverview An AI flow to analyze a social media story and suggest a reply.
 *
 * - analyzeStory - Analyzes a story description and provides an observation and a question.
 * - StoryAnalyzerInput - The input type for the flow.
 * - StoryAnalyzerOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryAnalyzerInputSchema = z.object({
  storyDescription: z.string().describe('A description of the social media story.'),
  userDetails: z.string().optional().describe('Optional details about the person who posted the story (Nature, Likes, Hobbies).'),
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response ('hi' for Hindi/Hinglish, 'en' for English)."),
});
export type StoryAnalyzerInput = z.infer<typeof StoryAnalyzerInputSchema>;

const StoryAnalyzerOutputSchema = z.object({
  observation: z.string().describe('A clever observation about the story.'),
  question: z.string().describe('A smart, non-intrusive question to ask about the story.'),
});
export type StoryAnalyzerOutput = z.infer<typeof StoryAnalyzerOutputSchema>;

export async function analyzeStory(input: StoryAnalyzerInput): Promise<StoryAnalyzerOutput> {
  return storyAnalyzerFlow(input);
}

const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational replies in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words and reference modern Gen-Z context.
Contextual Awareness: If the user provides details about their crush, use that information to tailor the reply. The tone should be casual, friendly, and witty, in Hinglish.`;

const globalSystemPrompt = `Role: You are a charismatic, smooth-talking Western dating expert for the 'Flirt AI' app.

Core Guidelines:
Vibe & Style: Generate clever, witty, and contextual story replies in pure, modern English. Use appropriate slang and emojis (e.g., 🔥, ✨, 👀, 🙌).
Non-Intrusive: The goal is to start a natural conversation, not to be overly aggressive. The tone should be casual and friendly.
Contextual Awareness: Use any provided details about the person to make the reply more personal and relevant.`;

const prompt = ai.definePrompt({
  name: 'storyAnalyzerPrompt',
  input: {schema: StoryAnalyzerInputSchema},
  output: {schema: StoryAnalyzerOutputSchema},
  prompt: `A user wants help replying to their crush's social media story.

Your task is to analyze the story description and any provided details about the person. Based on this, generate:
1.  A clever 'observation' about the story.
2.  A smart, non-intrusive 'question' to start a conversation.

Story Description: "{{{storyDescription}}}"
{{#if userDetails}}
About The Person: "{{{userDetails}}}"
{{/if}}

Return a single, valid JSON object with the 'observation' and 'question'.`,
});

const storyAnalyzerFlow = ai.defineFlow(
  {
    name: 'storyAnalyzerFlow',
    inputSchema: StoryAnalyzerInputSchema,
    outputSchema: StoryAnalyzerOutputSchema,
  },
  async input => {
    const systemPrompt = input.language === 'en' ? globalSystemPrompt : hindiSystemPrompt;
    const {output} = await prompt(input, { system: systemPrompt });
    return output!;
  }
);
