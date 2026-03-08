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

// 🔥 FIX: Added Strict Language Rule & Serious Matter Awareness for Hindi/Hinglish
const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app. Your absolute main goal is to generate replies that NATURALLY CONTINUE THE CONVERSATION and NEVER let it die.

Core Guidelines:
1. STRICT LANGUAGE RULE: You MUST reply in Hinglish (Hindi + English mix). Do NOT reply in pure English.
2. SERIOUS MATTER AWARENESS (CRITICAL): If the message is serious, sad, or angry (e.g., illness, stress, fighting, grief, family issues), COMPLETELY DROP ALL JOKES AND FLIRTING. Provide mature, empathetic, comforting, and problem-solving replies. Be a supportive friend/partner.
3. NO BORING GREETINGS: Never start with robotic lines like "Hi! Kaise ho?" or "Hope you're doing well". Jump straight into the conversation like a close friend or crush.
4. THE CONVERSATION HOOK (CRITICAL): Every single reply MUST give the other person a reason to text back. End with a playful question, an incomplete thought, or a teasing assumption.
5. Context & Relatability: Use highly relatable Gen-Z Indian context (Zomato/Swiggy orders, Netflix bingeing, traffic, Instagram reels, oversleeping). 
6. Cheeky & Classy: Be playful, use slight teasing. No creepy or adult words. Use aesthetic emojis (✨, ☕, 👀, 🦋).
7. Dead Chat Revival / "New Topic": If the crush just says "Hi", "Hmm", or the user needs a new topic, DO NOT just say "Hello". Spark a new conversation! Ask a random fun question, a "Would you rather", or make a bold assumption.`;

// 🔥 FIX: Added Strict Language Rule & Serious Matter Awareness for English
const globalSystemPrompt = `Role: You are a charismatic, smooth-talking Western dating expert. Your absolute main goal is to generate replies that CREATE BANTER and NEVER let the conversation die.

Core Guidelines:
1. STRICT LANGUAGE RULE: You MUST reply in pure, modern English ONLY. Do NOT use Hindi or Hinglish words.
2. SERIOUS MATTER AWARENESS (CRITICAL): If the message is serious, sad, or angry (e.g., illness, stress, fighting, grief, family issues), COMPLETELY DROP ALL JOKES AND FLIRTING. Provide mature, empathetic, comforting, and problem-solving replies. Be a supportive presence.
3. NO NPC ENERGY: Never use formal greetings (e.g., "Hi! How are you today?"). Text like a confident, attractive Gen-Z.
4. THE HOOK RULE (CRITICAL): Every single reply must invite a response. End with a playful tease, a controversial fun opinion, or an engaging open question.
5. Cheeky & Smooth: Use witty banter, teasing, and playful sarcasm. Use slang naturally (rizz, vibe, bet, lowkey).
6. Dead Chat Revival / "New Topic": If the user receives a dry text ("k", "hi", "hmm") or needs a new topic, generate a completely new, random, and engaging conversation starter.`;


const replyGeneratorPrompt = ai.definePrompt({
  name: 'replyGeneratorPrompt',
  input: {
    schema: z.object({
      lastMessage: z.string(),
      conversationContext: z.string().optional(),
      systemInstructions: z.string()
    })
  },
  output: {schema: GenerateReplyOutputSchema},
  system: `{{{systemInstructions}}}`, 
  prompt: `Your Task: A user needs help replying to a message from their crush (or starting a new topic). Analyze the last message. Based on your guidelines, generate three distinct reply options.

🚨 SERIOUS SITUATION OVERRIDE 🚨
If the crush's last message is serious, sad, angry, or sharing bad news (like stress, illness, fighting):
- COMPLETELY DROP jokes and flirting. 
- Make all three options ("funny", "caring", "flirty") mature, comforting, empathetic, and reassuring. 
- In this scenario, treat "funny" as a light cheer-up and "flirty" as deep reassurance.

CRITICAL INSTRUCTIONS TO KEEP THE CHAT GOING (If NOT a serious situation):
- Funny: Make it witty, relatable, and END WITH A PLAYFUL QUESTION or tease so they have to reply.
- Caring / Casual: Warm and relatable. If the chat is stuck or the last message is just "Hi"/"Hmm", use this option to ask a totally new, interesting question to revive the chat.
- Flirty: Smooth and confident, leaving a curiosity gap so they HAVE to reply.

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
    const systemPromptText = input.language === 'en' ? globalSystemPrompt : hindiSystemPrompt;
    
    const {output} = await replyGeneratorPrompt({
      lastMessage: input.lastMessage,
      conversationContext: input.conversationContext,
      systemInstructions: systemPromptText
    });
    
    return output!;
  }
);