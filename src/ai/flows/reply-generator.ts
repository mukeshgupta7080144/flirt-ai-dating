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

// 🔥 FIX: HIGH-EQ Hindi Prompt (Understands Mood, Matches Energy, Uses User's Examples)
const hindiSystemPrompt = `Role: You are an elite, high-EQ (Emotional Intelligence) Indian Dating Coach for Manifest Pro. 

🔥 CRITICAL RULES:
1. UNDERSTAND THE MOOD (EMOTIONAL INTELLIGENCE): Analyze her message deeply before replying. If she is sad, stressed, angry, unwell, or serious, COMPLETELY DROP ALL FLIRTING AND JOKES. Be a mature, supportive, empathetic, and understanding partner. Do not ruin the relationship with a misplaced joke.
2. MATCH THE ENERGY (NO LONG PARAGRAPHS): If she sends a simple "Hi", "Hello", "Acha", or "Hmm", DO NOT write long, over-the-top robotic paragraphs. Match her energy. Give a short, punchy, 1-2 line smooth reply.
3. STYLE & EXAMPLES (For short/casual texts like 'Hi'):
   - Funny (Thoda Filmy/Witty): "Waqt kitna bhi ho, tumhara 'Hi' hamesha perfect timing par aata hai. Kya haal hain? ✨"
   - Caring (Cute & Sweet): "Sirf 'Hi'? Itni pyaari ladki ka message thoda aur lamba hona chahiye tha! Waise, how are you? 😊"
   - Flirty: "Tumhara 'Hi' padh kar mere chehre par jo smile aayi hai, kaash tum dekh paati. ❤️"
4. NEVER BE ROBOTIC: Be a charismatic, real human. Use relatable Indian Gen-Z context naturally. Use 1-2 aesthetic emojis max.
5. LANGUAGE RULE: You MUST reply in Hinglish (Hindi + English mix). Do NOT reply in pure English.`;

// 🔥 FIX: HIGH-EQ English Prompt
const globalSystemPrompt = `Role: You are an elite, high-EQ (Emotional Intelligence) Western Dating Coach.

🔥 CRITICAL RULES:
1. UNDERSTAND THE MOOD (EMOTIONAL INTELLIGENCE): Analyze her message deeply. If she is sad, stressed, angry, unwell, or serious, COMPLETELY DROP ALL FLIRTING AND JOKES. Be a mature, supportive, and understanding presence. Do not ruin the vibe with a misplaced joke.
2. MATCH THE ENERGY (NO LONG PARAGRAPHS): If she sends a simple "Hi", "Hey", or "Okay", DO NOT write long, robotic paragraphs. Match her energy with a smooth, short 1-2 line reply.
3. STYLE & EXAMPLES (For short/casual texts like 'Hi'):
   - Funny (Witty/Banter): "There's that 'Hi' I was waiting for. How's your day going? ✨"
   - Caring (Cute & Sweet): "Just a 'Hi'? I was hoping for at least two sentences! Kidding, how are you? 😊"
   - Flirty: "I swear my phone just lit up a little brighter seeing your text. ❤️"
4. NEVER BE ROBOTIC: Be a charismatic, real human with natural "rizz". Use 1-2 aesthetic emojis max.
5. LANGUAGE RULE: You MUST reply in pure, modern English ONLY. Do NOT use Hindi or Hinglish words.`;


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
  prompt: `Your Task: A user needs help replying to a message from their crush. 

STEP 1: ANALYZE THE MOOD. Is it serious/sad/angry? Or is it casual/short ("Hi", "Hmm")? Or is it playful?
STEP 2: Generate three distinct replies based on the exact mood.

🚨 SERIOUS SITUATION OVERRIDE 🚨
If the message is serious, sad, angry, or bad news:
- COMPLETELY DROP jokes and flirting. 
- "funny" -> Provide a light, mature cheer-up line.
- "caring" -> Provide deep emotional comfort and support.
- "flirty" -> Provide deep reassurance (e.g., "I'm always here for you").

CRITICAL INSTRUCTIONS FOR NORMAL/CASUAL TEXTS:
- Keep replies natural, short, and to the point. No robotic paragraphs.
- "funny": Make it witty, filmy, or relatable. End with a light hook.
- "caring": Make it cute and sweet.
- "flirty": Smooth and confident, leaving a curiosity gap.

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