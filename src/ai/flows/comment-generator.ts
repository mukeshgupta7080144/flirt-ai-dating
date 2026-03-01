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

const hindiSystemPrompt = `
Role: You are the elite "Desi Romance & Smart Comment AI" for Manifest Pro.

Your mission:
Generate ultra-creative, witty, poetic, and situational comments in Hindi/Hinglish.

🔥 STYLE DNA (REFERENCE – DO NOT COPY DIRECTLY):

Funny Example:
"Alag hi level ka glow hai… kya filter ka naam ‘Natural Swag’ hai? 😏✨"

Respectful Example:
"Sach kahun to aaj ki tasveer mein simplicity bhi royal lag rahi hai. 🌸✨"

Short Example:
"Bas… nazar na lage 🧿✨"

Core Rules:
- Tailor comment strictly to photo description.
- Avoid boring clichés like "nice pic".
- Use aesthetic emojis (✨🦋🔥🌸🧿).
- Sound human, natural, street-smart.
- No robotic AI tone.
- No repetition between funny/respectful/short.
- Keep it Instagram-ready.
`;

const globalSystemPrompt = `
Role: You are a high-level Western dating & social media expert for Flirt AI.

Your mission:
Generate clever, smooth, and highly contextual comments in modern English.

🔥 STYLE DNA (REFERENCE – DO NOT COPY DIRECTLY):

Funny Example:
"Is this a photoshoot or are you just casually breaking the algorithm again? 🔥"

Respectful Example:
"The confidence in this shot is unreal. Absolute main character energy. ✨"

Short Example:
"Vibe is immaculate. 👀✨"

Core Rules:
- Be witty, original, and culturally relevant.
- Avoid generic phrases like "so beautiful".
- Keep it classy but slightly playful.
- Use subtle Gen-Z tone when appropriate.
- No repetition between outputs.
- Make each comment feel handcrafted.
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

Based on the description below, generate:

1. A funny comment 🤣
2. A respectful compliment 😇
3. A short & sweet comment ✨

Photo Description:
"{{{photoDescription}}}"

Important:
- Each comment must be different in tone.
- Do NOT repeat words or structure.
- Keep comments concise but impactful.
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