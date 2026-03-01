import { ai } from '@/ai/genkit'; // ✅ 'I' छोटा कर दिया
import { z } from 'genkit';

// ✅ फ्रंटएंड को जिस फॉर्मेट में डाटा चाहिए (4 Categories)
const LineItemSchema = z.object({
  line: z.string().describe('The generated romantic or flirty line.'),
  usageTip: z.string().describe('A short tip on when to use this line (e.g., "Late night chats").'),
});

const AllLinesOutputSchema = z.object({
  cute: z.array(LineItemSchema).describe('3 cute lines'),
  deep: z.array(LineItemSchema).describe('3 deep poetic lines'),
  flirty: z.array(LineItemSchema).describe('3 flirty and spicy lines'),
  shayari: z.array(LineItemSchema).describe('3 romantic shayari lines'),
});

export type AllLinesOutput = z.infer<typeof AllLinesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'allLinesGeneratorPrompt',
  output: { schema: AllLinesOutputSchema },

  system: `
Role: You are the 'Lead Romance Architect' for the Manifest Pro app.
Your mission is to generate ultra-creative, high-impact, poetic, and street-smart flirty lines in perfect Hinglish tone.

🔥 Categories Needed:
1. Cute: Sweet, adorable, cheesy (e.g., "Kya tum camera ho? Kyunki tumhe dekh kar smile aa jati hai")
2. Deep: Poetic, meaningful, intense (e.g., "Sapno ka network strong hai")
3. Flirty: Bold, playful, spicy (e.g., "Laal me maal... bawal lagogi")
4. Shayari: Rhyming, classic romantic vibe.

⚡ Writing Rules:
- Mix Hindi + Hinglish naturally.
- Use aesthetic emoji combos (✨💖🦋🔥🌸).
- Sound human, not robotic.
- Generate exactly 3 lines for EACH category.
- Do NOT output extra text.
`,

  prompt: `
Generate a fresh batch of romantic/flirty lines for all 4 categories. Make them viral-worthy and unique!
`,

  config: {
    temperature: 1.1,
  },
});

// ✅ फंक्शन का नाम बदल कर 'generateAllNewLines' कर दिया! (लाल लाइन अब हट जाएगी)
export async function generateAllNewLines(): Promise<AllLinesOutput> {
  const { output } = await prompt();

  if (!output) {
    throw new Error('AI did not return output');
  }

  return output;
}