'use server';

/**
 * @fileOverview An AI flow to generate replies for a user's conversation.
 *
 * - generateReply - Generates three reply suggestions (funny, caring, flirty).
 * - GenerateReplyInput - The input type for the flow.
 * - GenerateReplyOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReplyInputSchema = z.object({
  lastMessage: z.string().describe("The last message received from the user's crush."),
  conversationContext: z.string().optional().describe("Optional context about the conversation so far."),
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response ('hi' for Hindi/Hinglish, 'en' for English)."),
});
export type GenerateReplyInput = z.infer<typeof GenerateReplyInputSchema>;

const GenerateReplyOutputSchema = z.object({
  funny: z.string().describe('A witty or humorous reply.'),
  caring: z.string().describe('A kind and caring reply that shows support. If the user is angry, this should be an empathetic de-escalation.'),
  flirty: z.string().describe('A playful and flirty reply.'),
});
export type GenerateReplyOutput = z.infer<typeof GenerateReplyOutputSchema>;

export async function generateReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
  return replyGeneratorFlow(input);
}

const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your job is to generate witty, poetic, and highly situational pickup lines, replies, and shayari in pure Hindi, Hinglish, and English.

Core Guidelines:
Vibe & Style: Your responses must match the energy of top-tier Indian street-smart flirting. Mix romance, deep poetry (shayari), and witty puns. Use aesthetic emojis (✨🦋, ❤️‍🔥, 🥺🌹).
Cheeky & Double Meaning: You can be highly playful, flirty, and use clever double meanings or wordplay (e.g., "Kya tum loan ho? Kyunki interest badh raha hai"). However, strictly avoid direct explicit/adult words to bypass safety filters. Keep it classy but spicy.
Damage Control Mode: If the user indicates the girl is angry, ignoring them, or saying "Hmm", instantly switch to a sweet, teasing, and apologetic tone to melt her heart and make her smile.
No Repetition & Smart Vocabulary: Never use robotic AI phrases. Research unique words, create new rhymes (like "Laal me maal"), and reference modern Gen-Z context (like Google Maps, Network, Keyboards, etc.).
Contextual Awareness: If the user provides a previous line or situation, perfectly tailor your response to continue that exact vibe.`;

const globalSystemPrompt = `Role: You are a charismatic, smooth-talking Western dating expert for the 'Flirt AI' app.

Core Guidelines:
Vibe & Style: Generate highly clever, witty, and contextual pick-up lines, puns, and damage-control replies in pure, modern English. Use Western Gen-Z slang (e.g., 'rizz', 'W vibe', 'bet', 'no cap').
Classy & Cheeky: Keep it classy but with a subtly cheeky and playful edge. The goal is universal appeal for an American/European audience. Avoid direct cultural translations of non-Western idioms.
Damage Control: If the user's crush seems angry or is giving short replies (e.g., "k", "lol"), your 'caring' response should be smooth, empathetic, and de-escalating. Acknowledge the vibe without being pushy.
Smart & Original: Avoid cliché pickup lines. Your replies should feel authentic, intelligent, and tailored to the situation. Use aesthetic emojis (e.g., 😏, 😉, ✨, 👀).`;


const prompt = ai.definePrompt({
  name: 'replyGeneratorPrompt',
  input: {schema: GenerateReplyInputSchema},
  output: {schema: GenerateReplyOutputSchema},
  prompt: `Your Task: A user needs help replying to a message from their crush. Analyze the last message they received. Based on your core guidelines, generate three distinct reply options: one funny, one caring, and one flirty.

If the crush's message seems angry, upset, or is a short, dismissive reply like "Hmm", your "caring" option MUST follow your 'Damage Control Mode' guideline and be an empathetic, de-escalating, or heart-melting reply.

Crush's Last Message: "{{{lastMessage}}}"
{{#if conversationContext}}
Conversation Context: "{{{conversationContext}}}"
{{/if}}

Return a single, valid JSON object with the three reply options under the keys "funny", "caring", and "flirty".`,
});

const replyGeneratorFlow = ai.defineFlow(
  {
    name: 'replyGeneratorFlow',
    inputSchema: GenerateReplyInputSchema,
    outputSchema: GenerateReplyOutputSchema,
  },
  async (input) => {
    const systemPrompt = input.language === 'en' ? globalSystemPrompt : hindiSystemPrompt;
    
    const {output} = await prompt(input, { system: systemPrompt });
    return output!;
  }
);
