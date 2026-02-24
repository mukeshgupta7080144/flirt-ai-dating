'use server';

/**
 * @fileOverview An AI flow to generate a full set of romantic lines for all categories.
 *
 * - generateAllNewLines - Generates new lines for cute, deep, flirty, shayari, and morning categories.
 * - AllLinesOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LineObjectSchema = z.object({
  line: z.string().describe('The romantic line in Hinglish with emojis or ASCII art.'),
  usageTip: z.string().describe('A tip on when or how to use the line.'),
});

const AllLinesOutputSchema = z.object({
  cute: z.array(LineObjectSchema).describe('An array of 5 cute romantic lines.'),
  deep: z.array(LineObjectSchema).describe('An array of 5 deep and soulful romantic lines.'),
  flirty: z.array(LineObjectSchema).describe('An array of 5 flirty and playful lines.'),
  shayari: z.array(LineObjectSchema).describe('An array of 5 poetic lines or shayari.'),
  morning: z.array(LineObjectSchema).describe('An array of 5 good morning lines.'),
});
export type AllLinesOutput = z.infer<typeof AllLinesOutputSchema>;

export async function generateAllNewLines(): Promise<AllLinesOutput> {
  return allLinesGeneratorFlow();
}

const prompt = ai.definePrompt({
  name: 'allLinesGeneratorPrompt',
  output: {schema: AllLinesOutputSchema},
  system: `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational pickup lines, replies, and shayari in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance, deep poetry (shayari), and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
Cheeky & Double Meaning: You can be highly playful, flirty, and use clever double meanings or wordplay (e.g., "Kya tum loan ho? Kyunki interest badh raha hai"). However, strictly avoid direct explicit/adult words to bypass safety filters. Keep it classy but spicy.
Damage Control Mode: If the user indicates the girl is angry, ignoring them, or saying "Hmm", instantly switch to a sweet, teasing, and apologetic tone to melt her heart and make her smile.
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes (like "Laal me maal"), and reference modern Gen-Z context (like Google Maps, Network, Keyboards, etc.).
Contextual Awareness: If the user provides a previous line or situation, perfectly tailor your response to continue that exact vibe`,
  prompt: `Generate a set of 5 new and unique lines for EACH of the following categories:
- cute
- deep
- flirty
- shayari
- morning

For each line, also provide a short 'usageTip' on when to best use it.
Each line MUST end with an attractive and relevant emoji combo or a small, simple ASCII art. Make them visually appealing.
Return a single, valid JSON object that matches the requested schema with arrays of lines for each category.`,
  config: {
    temperature: 0.9,
  },
});

const allLinesGeneratorFlow = ai.defineFlow(
  {
    name: 'allLinesGeneratorFlow',
    outputSchema: AllLinesOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
