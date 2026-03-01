'';

/**
 * @fileOverview An AI flow to generate a single romantic/flirty line.
 *
 * - generateNewLine - Generates one new line.
 * - NewLineOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewLineOutputSchema = z.object({
  line: z.string().describe('A romantic, cute, or flirty line in Hinglish with emojis.'),
});
export type NewLineOutput = z.infer<typeof NewLineOutputSchema>;

export async function generateNewLine(): Promise<NewLineOutput> {
  return lineGeneratorFlow();
}

const prompt = ai.definePrompt({
  name: 'lineGeneratorPrompt',
  output: {schema: NewLineOutputSchema},
  system: `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational pickup lines, replies, and shayari in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance, deep poetry (shayari), and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
Cheeky & Double Meaning: You can be highly playful, flirty, and use clever double meanings or wordplay (e.g., "Kya tum loan ho? Kyunki interest badh raha hai"). However, strictly avoid direct explicit/adult words to bypass safety filters. Keep it classy but spicy.
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes (like "Laal me maal"), and reference modern Gen-Z context (like Google Maps, Network, Keyboards, etc.).`,
  prompt: `Generate a single, new, and unique romantic or flirty line suitable for sending to a crush.
The line must be visually attractive and include a unique emoji combo or a small, simple ASCII art at the end.
Return a single, valid JSON object with the line.`,
  config: {
    temperature: 0.9,
  },
});

const lineGeneratorFlow = ai.defineFlow(
  {
    name: 'lineGeneratorFlow',
    outputSchema: NewLineOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
