/**
 * @fileOverview An AI flow to generate a single romantic/flirty line.
 *
 * - generateNewLine - Generates one new line.
 * - NewLineOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 🔥 FIX: Input Schema में 'language' जोड़ दिया
const NewLineInputSchema = z.object({
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response"),
});
export type NewLineInput = z.infer<typeof NewLineInputSchema>;

const NewLineOutputSchema = z.object({
  line: z.string().describe('A romantic, cute, or flirty line.'),
});
export type NewLineOutput = z.infer<typeof NewLineOutputSchema>;

// 🔥 FIX: Function अब input लेगा
export async function generateNewLine(input?: NewLineInput): Promise<NewLineOutput> {
  return lineGeneratorFlow(input || { language: 'hi' });
}

// 🧠 HINDI BRAIN
const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational pickup lines and shayari in Hinglish (Hindi + English mix).

Core Guidelines:
- Mix romance, deep poetry, and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
- Keep it playful and flirty but classy. Avoid adult words.
- Research unique words, create new rhymes, and reference modern Gen-Z context.
CRITICAL RULE: You MUST return ONLY a raw JSON object. DO NOT wrap the JSON in \`\`\`json ... \`\`\` markdown blocks.`;

// 🧠 ENGLISH BRAIN
const englishSystemPrompt = `Role: You are the ultimate 'Western Romance & Flirting AI' for the Manifest Pro app. Your job is to generate clever, smooth, and highly situational pickup lines and flirty texts in pure, modern English.

Core Guidelines:
- Use Western Gen-Z slang naturally (rizz, vibe, smooth). Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺).
- Keep it playful and flirty but classy. Avoid old clichés.
- Sound like a confident human, not a robot.
CRITICAL RULE: You MUST return ONLY a raw JSON object. DO NOT wrap the JSON in \`\`\`json ... \`\`\` markdown blocks.`;

const prompt = ai.definePrompt({
  name: 'lineGeneratorPrompt',
  input: {
    schema: z.object({
      systemInstructions: z.string()
    })
  },
  output: {schema: NewLineOutputSchema},
  system: `{{{systemInstructions}}}`,
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
    inputSchema: NewLineInputSchema,
    outputSchema: NewLineOutputSchema,
  },
  async (input) => {
    try {
      // 🔥 जादुई लाइन: जो यूज़र की भाषा चेक करेगी
      const systemPromptText = input.language === 'en' ? englishSystemPrompt : hindiSystemPrompt;
      
      const {output} = await prompt({
        systemInstructions: systemPromptText
      });
      
      if (!output) {
        throw new Error("AI returned empty output");
      }
      
      return output;
      
    } catch (error) {
      console.error("🚨 Line Generator Flow Error:", error);
      
      // 🛡️ SAFE SHIELD: भाषा के हिसाब से एरर मैसेज!
      const fallbackLine = input.language === 'en' 
        ? "Looks like the AI server melted from your hotness! Try again in a bit 🥺❤️‍🔥"
        : "Lagta hai tumhari baaton ki garmi se AI ka server pighal gaya! Thodi der baad try karo 🥺❤️‍🔥";

      return { line: fallbackLine };
    }
  }
);