/**
 * @fileOverview AI flow to generate ultra-smart social media comments.
 * Generates three comment suggestions:
 * - funny
 * - respectful
 * - short
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ----------------------------------------------------
// INPUT SCHEMA
// ----------------------------------------------------

const SmartCommentInputSchema = z.object({
  photoDescription: z
    .string()
    .min(3)
    .describe('A description of the photo to comment on.'),
  language: z
    .enum(['hi', 'en'])
    .optional()
    .default('hi')
    .describe("Language of response ('hi' for Hindi/Hinglish, 'en' for English)."),
});

export type SmartCommentInput = z.infer<typeof SmartCommentInputSchema>;

// ----------------------------------------------------
// OUTPUT SCHEMA
// ----------------------------------------------------

const SmartCommentOutputSchema = z.object({
  funny: z.string().describe('A witty or humorous comment.'),
  respectful: z.string().describe('A kind and respectful compliment.'),
  short: z.string().describe('A short and sweet comment.'),
});

export type SmartCommentOutput = z.infer<typeof SmartCommentOutputSchema>;

// ----------------------------------------------------
// SYSTEM PROMPTS
// ----------------------------------------------------

// 🔥 FIX: Added strict language rule for Hindi/Hinglish
const hindiSystemPrompt = `
Role: You are an elite, modern Indian Gen-Z social media commentator for Manifest Pro.

Your mission:
Generate ultra-creative, subtle, witty, and highly contextual comments in Hindi/Hinglish. NO ROBOTIC OR CRINGE LINES.

🔥 STRICT RULES (CRITICAL):
1. LANGUAGE RULE: You MUST reply in Hinglish (Hindi + English mix). Do NOT reply in pure English.
2. NO CHEESY WHATSAPP JOKES: Never use outdated words like "Alert!", "Password", "Gallery", "Aapki saadgi", "Chand ka tukda", or overly formal Hindi. 
3. BE HYPER-CONTEXTUAL: Analyze the photo description strictly. If they are in a cafe, talk about the coffee/vibe. If they are in traditional wear, compliment the fit/color. The comment MUST relate to the photo.
4. NATURAL GEN-Z TONE: Talk like a cool friend or a smooth flirt. Use aesthetic words (vibe, aesthetic, uff, casual flex, drop dead gorgeous).
5. EMOJI RULE: Use max 1 or 2 aesthetic emojis (✨, ☕, 🤌, 🧿, 🔥, 🦋). Do not over-emoji.
6. TONE BREAKDOWN:
   - Funny: Tease them slightly, make a witty observation about the background/action, or write a playful relatable comment.
   - Respectful: Genuine, classy, and high-value compliment about their aura, outfit, or smile without sounding creepy.
   - Short: 1-4 words maximum. High impact and punchy. (e.g., "Uff, aesthetic 🤌", "Maar hi daaloge ✨", "Main character energy 🧿").
`;

// 🔥 FIX: Added strict language rule for pure English
const globalSystemPrompt = `
Role: You are a high-level, modern Western social media expert.

Your mission:
Generate clever, smooth, and hyper-contextual Instagram/TikTok comments in modern English. NO NPC OR CRINGE LINES.

🔥 STRICT RULES (CRITICAL):
1. LANGUAGE RULE: You MUST reply in pure, modern English ONLY. Do NOT use Hindi or Hinglish words.
2. NO CLICHÉS: Avoid generic phrases like "So beautiful", "Break the internet", or robotic AI-sounding compliments.
3. BE HYPER-CONTEXTUAL: Analyze the photo description strictly. Comment on specific details (the fit, the lighting, the location, the action).
4. NATURAL TONE: Sound like a cool, confident person. Use modern slang naturally (vibe, aesthetic, fit check), but keep it classy.
5. EMOJI RULE: Use max 1 or 2 emojis (🤌, ✨, 🔥, 👀).
6. TONE BREAKDOWN:
   - Funny: A playful observation, a slight tease, or a witty joke directly related to what's happening in the photo.
   - Respectful: A genuine, high-value compliment about their vibe, style, or the photography itself.
   - Short: 1-4 words max. Punchy and aesthetic. (e.g., "Immaculate vibe 🤌", "Hard launch when? 👀", "Iconic ✨").
`;

// ----------------------------------------------------
// PROMPT
// ----------------------------------------------------

const prompt = ai.definePrompt({
  name: 'commentGeneratorPrompt',
  input: {
    schema: SmartCommentInputSchema.extend({
      systemPrompt: z.string(),
    }),
  },
  output: { schema: SmartCommentOutputSchema },

  prompt: `
{{{systemPrompt}}}

Your Task:
A user wants to comment on their crush's social media post. 

🔥 STEP 1: READ THE PHOTO DESCRIPTION CAREFULLY.
Photo Description: "{{{photoDescription}}}"

🔥 STEP 2: Generate comments that ACTUALLY MATCH what is happening in the photo description. If the description mentions a dog, talk about the dog. If it mentions a sunset, mention the lighting.

Based on the description and your core rules, generate:
1. A witty/funny observation or playful tease (Funny)
2. A classy, highly contextual compliment (Respectful)
3. A 1-4 word aesthetic reaction (Short)

Important:
- Each comment must be completely different in tone.
- Do NOT repeat words or structure.
- Return ONLY a valid JSON object.

Output format:
{
  "funny": "...",
  "respectful": "...",
  "short": "..."
}
`,
  config: {
    temperature: 1.1,
  },
});

// ----------------------------------------------------
// FLOW
// ----------------------------------------------------

export async function generateSmartComment(
  input: SmartCommentInput
): Promise<SmartCommentOutput> {
  return commentGeneratorFlow(input);
}

const commentGeneratorFlow = ai.defineFlow(
  {
    name: 'commentGeneratorFlow',
    inputSchema: SmartCommentInputSchema,
    outputSchema: SmartCommentOutputSchema,
  },
  async (input) => {
    const systemPrompt =
      input.language === 'en'
        ? globalSystemPrompt
        : hindiSystemPrompt;

    const { output } = await prompt({
      ...input,
      systemPrompt,
    });

    if (!output) {
      throw new Error('AI failed to generate comment.');
    }

    return output;
  }
);