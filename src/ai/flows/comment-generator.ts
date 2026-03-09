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

// 🔥 FIX: Super Creative Hindi/Hinglish Prompt based on User's Elite Examples
const hindiSystemPrompt = `
Role: You are an elite, highly creative Indian Gen-Z social media commentator. 

Your mission:
Generate ultra-creative, unique, poetic, and catchy comments in Hindi/Hinglish. NO ROBOTIC OR REPETITIVE LINES. 

🔥 STRICT RULES & VIBE (CRITICAL):
1. LANGUAGE RULE: Reply in Hinglish (Hindi + English mix).
2. NO BORING/OLD LINES: Never use "Alert!", "Password", "Gallery", "Aapki saadgi", "Chand ka tukda". Stop using the "phone storage full" joke.
3. BE FRESH & UNIQUE: Every time, think of a brand new, out-of-the-box compliment. Make it sound like a charming, real person wrote it.
4. TONE BREAKDOWN (Follow this vibe):
   - Funny (Creative/Teasing): Like "Pata nahi chashma zyada suit kar raha hai ya aapki smile, dono hi killer hain! 💯" OR "Instagram ka server crash karwane ka irada hai kya? Too cute! 🔥"
   - Respectful (Sweet & Poetic): Like "Ye smile kisi ka bhi din banane ke liye kaafi hai! ✨" OR "Tasveer itni pyaari hai ki shabd kam pad rahe hain. ❤️"
   - Short (Catchy): Like "Pure Radiance! ✨" OR "Definition of Grace. ❤️" OR "Totally aesthetic! 😍"
5. HYPER-CONTEXTUAL: If the photo description mentions a specific item (like specs, coffee, sunset, dress color), WEAPONIZE that detail in your comment cleverly.
`;

// 🔥 FIX: Super Creative English Prompt
const globalSystemPrompt = `
Role: You are an elite, highly creative Western social media expert.

Your mission:
Generate clever, smooth, unique, and poetic Instagram/TikTok comments in modern English. NO NPC OR REPETITIVE LINES.

🔥 STRICT RULES & VIBE (CRITICAL):
1. LANGUAGE RULE: Reply in pure, modern English ONLY.
2. NO CLICHÉS: Avoid generic phrases like "So beautiful", "Break the internet", or robotic AI-sounding compliments.
3. BE FRESH & UNIQUE: Every time, think of a brand new, out-of-the-box compliment. Make it sound effortless and charismatic.
4. TONE BREAKDOWN (Follow this vibe):
   - Funny (Creative Banter): Clever, witty observations. e.g., "Are you trying to crash the Instagram servers today? 🔥" or "I don't know what looks better, the view or you. 💯"
   - Respectful (Sweet & Poetic): Genuine, heart-melting. e.g., "This smile could literally make anyone's day ✨" or "A picture so perfect, words fall short. ❤️"
   - Short (Catchy): 1-4 words. e.g., "Pure radiance ✨", "Definition of grace ❤️", "Absolute perfection 😍".
5. HYPER-CONTEXTUAL: Always tie the comment directly to specific details in the photo description (the outfit, the location, the vibe).
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

🔥 STEP 2: Generate comments that ACTUALLY MATCH the description. Be highly creative. NEVER repeat the same jokes.

Based on the description and your core rules, generate:
1. A unique, creative, or witty tease (Funny)
2. A sweet, poetic, or deeply genuine compliment (Respectful)
3. A 1-4 word catchy, aesthetic reaction (Short)

Important:
- Each comment must have a completely different tone.
- Return ONLY a valid JSON object.

Output format:
{
  "funny": "...",
  "respectful": "...",
  "short": "..."
}
`,
  config: {
    temperature: 1.1, // High temperature for maximum creativity
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