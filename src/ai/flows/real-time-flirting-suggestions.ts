'';

/**
 * @fileOverview A flow that generates real-time flirting suggestions for shy users.
 *
 * - generateFlirtingSuggestion - A function that generates a flirting suggestion based on the input context.
 * - RealTimeFlirtingSuggestionsInput - The input type for the generateFlirtingSuggestion function.
 * - RealTimeFlirtingSuggestionsOutput - The return type for the generateFlirtingSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeFlirtingSuggestionsInputSchema = z.object({
  context: z.string().describe('The context of the conversation or situation.'),
  userMood: z.string().describe('The current mood of the user.'),
  targetInterest: z.string().describe('The interests of the target person you want to flirt with.'),
});
export type RealTimeFlirtingSuggestionsInput = z.infer<typeof RealTimeFlirtingSuggestionsInputSchema>;

const RealTimeFlirtingSuggestionsOutputSchema = z.object({
  suggestion: z.string().describe('A real-time suggestion for flirting or initiating a conversation.'),
});
export type RealTimeFlirtingSuggestionsOutput = z.infer<typeof RealTimeFlirtingSuggestionsOutputSchema>;

export async function generateFlirtingSuggestion(input: RealTimeFlirtingSuggestionsInput): Promise<RealTimeFlirtingSuggestionsOutput> {
  return realTimeFlirtingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeFlirtingSuggestionsPrompt',
  input: {schema: RealTimeFlirtingSuggestionsInputSchema},
  output: {schema: RealTimeFlirtingSuggestionsOutputSchema},
  system: `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational pickup lines, replies, and shayari in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance, deep poetry (shayari), and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
Cheeky & Double Meaning: You can be highly playful, flirty, and use clever double meanings or wordplay (e.g., "Kya tum loan ho? Kyunki interest badh raha hai"). However, strictly avoid direct explicit/adult words to bypass safety filters. Keep it classy but spicy.
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes (like "Laal me maal"), and reference modern Gen-Z context (like Google Maps, Network, Keyboards, etc.).
Contextual Awareness: If the user provides a previous line or situation, perfectly tailor your response to continue that exact vibe.`,
  prompt: `Based on the current context, user mood, and the target's interests, provide a single, concise suggestion for flirting or initiating a conversation.

  Context: {{{context}}}
  User Mood: {{{userMood}}}
  Target Interests: {{{targetInterest}}}

  Return your suggestion in the required JSON format.`,
  config: {
    temperature: 0.9,
  },
});

const realTimeFlirtingSuggestionsFlow = ai.defineFlow(
  {
    name: 'realTimeFlirtingSuggestionsFlow',
    inputSchema: RealTimeFlirtingSuggestionsInputSchema,
    outputSchema: RealTimeFlirtingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
