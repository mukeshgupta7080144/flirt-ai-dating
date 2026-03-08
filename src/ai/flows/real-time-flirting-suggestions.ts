/**
 * @fileOverview A flow that generates real-time flirting suggestions for shy users.
 *
 * - generateFlirtingSuggestion - A function that generates a flirting suggestion based on the input context.
 * - RealTimeFlirtingSuggestionsInput - The input type for the generateFlirtingSuggestion function.
 * - RealTimeFlirtingSuggestionsOutput - The return type for the generateFlirtingSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// 🔥 FIX: Input Schema में 'language' जोड़ दिया गया है ताकि यह हिंदी/इंग्लिश दोनों समझ सके
const RealTimeFlirtingSuggestionsInputSchema = z.object({
  context: z.string().describe('The context of the conversation or situation.'),
  userMood: z.string().describe('The current mood of the user.'),
  targetInterest: z.string().describe('The interests of the target person you want to flirt with.'),
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response ('hi' for Hindi/Hinglish, 'en' for English)."),
});
export type RealTimeFlirtingSuggestionsInput = z.infer<typeof RealTimeFlirtingSuggestionsInputSchema>;

const RealTimeFlirtingSuggestionsOutputSchema = z.object({
  suggestion: z.string().describe('A real-time suggestion for flirting or initiating a conversation.'),
});
export type RealTimeFlirtingSuggestionsOutput = z.infer<typeof RealTimeFlirtingSuggestionsOutputSchema>;

export async function generateFlirtingSuggestion(input: RealTimeFlirtingSuggestionsInput): Promise<RealTimeFlirtingSuggestionsOutput> {
  return realTimeFlirtingSuggestionsFlow(input);
}

// 🧠 HINDI BRAIN: For Desi Hinglish Users
const hindiSystemPrompt = `Role: You are the ultimate 'Elite Gen-Z Dating Coach & Rizz Expert' for the Manifest Pro app. Your job is to generate highly contextual, smooth, and natural flirting suggestions in Hinglish (Hindi + English mix).

🔥 STRICT RULES (CRITICAL):
1. NO ROBOTIC OR CRINGE LINES: Never sound like a customer service AI. Talk like a charismatic, high-EQ person.
2. WEAPONIZE THEIR INTERESTS: If the Target Interest is 'Coffee', say something cheeky like, "Tumhari coffee se zyada strong mera tumhe text karne ka reason hai ☕✨". 
3. CHEEKY & SMOOTH: Be playful, use slight teasing, and leave a curiosity gap. Keep it classy.
4. NATURAL VOCABULARY: Use modern slang naturally (vibe, aesthetic, subtle flex). Use only 1-2 aesthetic emojis (✨, 👀, 🦋, 🤌).
5. THE HOOK: The suggestion MUST end in a way that naturally invites a response (a playful question or a tease).`;

// 🧠 ENGLISH BRAIN: For Western/Pure English Users
const englishSystemPrompt = `Role: You are the ultimate 'Elite Gen-Z Dating Coach & Rizz Expert' for the Manifest Pro app. Your job is to generate highly contextual, smooth, and natural flirting suggestions in pure, modern English.

🔥 STRICT RULES (CRITICAL):
1. NO ROBOTIC OR CRINGE LINES: Never sound like a customer service AI. Talk like a charismatic, high-EQ person with natural "rizz".
2. WEAPONIZE THEIR INTERESTS: Use their interests to create a clever connection. (e.g., If coffee, "Are you a double espresso? Because you're keeping me up all night 👀☕").
3. CHEEKY & SMOOTH: Be playful, use slight teasing, and leave a curiosity gap. Keep it classy.
4. NATURAL VOCABULARY: Use modern slang naturally (vibe, aesthetic, lowkey, green flag). Use only 1-2 aesthetic emojis.
5. THE HOOK: The suggestion MUST end in a way that naturally invites a response (a playful question or a tease).`;


const prompt = ai.definePrompt({
  name: 'realTimeFlirtingSuggestionsPrompt',
  input: {
    schema: z.object({
      context: z.string(),
      userMood: z.string(),
      targetInterest: z.string(),
      systemInstructions: z.string() // डायनामिक भाषा के लिए
    })
  },
  output: {schema: RealTimeFlirtingSuggestionsOutputSchema},
  system: `{{{systemInstructions}}}`,
  prompt: `Generate a single, hyper-contextual, and ultra-smooth flirting suggestion. It must sound like it was written by a confident human, NOT an AI.

Context: {{{context}}}
User Mood: {{{userMood}}}
Target Interests: {{{targetInterest}}}

Make sure the line directly uses their interests to create a clever connection or tease. 
Return ONLY your suggestion in the required JSON format.`,
  config: {
    temperature: 0.9,
  },
});

const realTimeFlirtingSuggestionsFlow = ai.defineFlow(
  {
    name: 'realTimeFlirtingSuggestionsFlow',
    inputSchema: RealTimeFlirtingSuggestionsInputSchema,
    outputSchema: RealTimeFlirtingSuggestionsOutputSchema,
  },
  async input => {
    // 🔥 जादुई लाइन: जो यूज़र की भाषा चेक करके सही 'दिमाग' (Prompt) लगाएगी
    const systemPromptText = input.language === 'en' ? englishSystemPrompt : hindiSystemPrompt;
    
    const {output} = await prompt({
      context: input.context,
      userMood: input.userMood,
      targetInterest: input.targetInterest,
      systemInstructions: systemPromptText
    });
    
    return output!;
  }
);