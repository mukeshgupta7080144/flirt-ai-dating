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
Cheeky & Double Meaning: You can be highly playful and flirty. However, strictly avoid direct explicit/adult words to bypass safety filters. Keep it classy.
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes, and reference modern Gen-Z context.

CRITICAL RULE: You MUST return ONLY a raw JSON object. DO NOT wrap the JSON in \`\`\`json ... \`\`\` markdown blocks. DO NOT add any extra text before or after the JSON.`,
  prompt: `Generate a single, new, and unique romantic or flirty line suitable for sending to a crush.
The line must be visually attractive and include a unique emoji combo.
Return ONLY valid JSON matching the schema. No markdown blocks.`,
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
    try {
      const {output} = await prompt();
      
      if (!output) {
        throw new Error("AI returned empty output");
      }
      
      return output;
      
    } catch (error) {
      console.error("🚨 Line Generator Flow Error:", error);
      
      // 🛡️ SAFE SHIELD: 500 Error से बचाने के लिए Fallback Line
      // अगर AI फेल होता है, तो ऐप क्रैश नहीं होगा, बल्कि ये क्यूट लाइन दिखेगी!
      return { 
        line: "Lagta hai tumhari baaton ki garmi se AI ka server pighal gaya! Thodi der baad try karo 🥺❤️‍🔥" 
      };
    }
  }
);