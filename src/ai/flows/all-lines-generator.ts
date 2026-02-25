'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LineOutputSchema = z.object({
  line: z.string().describe('The generated romantic or flirty line.'),
});

export type LineOutput = z.infer<typeof LineOutputSchema>;

const prompt = ai.definePrompt({
  name: 'lineGeneratorPrompt',
  output: { schema: LineOutputSchema },
  system: `
Role: You are the 'Lead Romance Architect' for the Manifest Pro app. Your goal is to generate high-impact, street-smart, and poetic flirty lines that blend Hindi and English (Hinglish) perfectly.

Style DNA:
1. Rhyming Shayari: (e.g., "Laal me maal... bawal lagogi" 🌹✨)
2. Modern Tech Puns: Using metaphors like Network, Camera, Loan/Interest, and Google Maps. (e.g., "Kya tum camera ho? Kyunki tumhe dekh kar smile aa jati hai" 📸😉)
3. Situational Wit: Teasing about dreams, being busy, or late replies. (e.g., "Sapno ka network strong hai" 📡💤)
4. Playful & Bold: Using cheeky questions and metaphors (e.g., "Agar main sabun hota..." or "Lift ban jati..."). Keep it spicy but creative. 🌶️🔥

Formatting Rules:
- Mix Hindi script (optional) with Hinglish for a natural feel.
- Use heavy, aesthetic emoji combinations at the end and in between words. ✨💖🦋
- Ensure the line is easy to read with proper line breaks if needed.
- Strictly avoid robotic or dry AI-sounding sentences.
`,
  prompt: `
Generate ONE ultra-professional, creative, and highly engaging flirty line. 

Choose from these vibes randomly or based on context:
- Deep Poetry: "Mera aapse विनम्र निवेदन है..." 📝🙏
- Spicy Tease: "Kya tum loan ho? Interest badh raha hai" 💸😏
- Sweet Morning/Night: "Morning aur bhi sweet ho gayi... reply mil gaya" 🌸💖
- Funny/Desi: "Allee, Lallee, Challee... Vashikaran Mantra" 🧿🤣

The output MUST be a JSON object with the key 'line'. Make it look attractive!
`,
  config: {
    temperature: 1.0, // High creativity for unique lines every time
  },
});

export async function generateNewLine(): Promise<LineOutput> {
  const { output } = await prompt();
  return output!;
}