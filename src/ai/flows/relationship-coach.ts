/**
 * @fileOverview This file defines a Genkit flow for providing personalized relationship coaching.
 *
 * The flow takes a user's problem description and returns a structured, empathetic, and actionable solution.
 * - `getRelationshipCoachAdvice` - A function that initiates the relationship coaching flow.
 * - `RelationshipCoachInput` - The input type for the `getRelationshipCoachAdvice` function.
 * - `RelationshipCoachOutput` - The output type for the `getRelationshipCoachAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RelationshipCoachInputSchema = z.object({
  relationshipDescription: z
    .string()
    .describe('A detailed description of the user\'s relationship problem.'),
  language: z.enum(['hi', 'en']).optional().default('hi').describe("The language for the AI response ('hi' for Hindi/Hinglish, 'en' for English)."),
});
export type RelationshipCoachInput = z.infer<typeof RelationshipCoachInputSchema>;

const RelationshipCoachOutputSchema = z.object({
    understanding: z.string().describe("An empathetic summary of the user's problem."),
    mistakesToAvoid: z.array(z.string()).describe("A list of 2-3 common mistakes the user should avoid."),
    actionableSteps: z.array(z.object({
      step: z.string().describe("The step number, e.g., 'Step 1'."),
      title: z.string().describe("The title of the step."),
      description: z.string().describe("A detailed description of the action to take."),
    })).describe("A list of 3-4 clear, actionable steps the user should take."),
    followUpPrompt: z.string().describe("A short, engaging prompt asking the user to provide an update tomorrow.")
  });
export type RelationshipCoachOutput = z.infer<typeof RelationshipCoachOutputSchema>;

export async function getRelationshipCoachAdvice(input: RelationshipCoachInput): Promise<RelationshipCoachOutput> {
  return relationshipCoachFlow(input);
}

const hindiSystemPrompt = `Role: You are the ultimate 'Desi Romance & Flirting AI' for the Manifest Pro app, but in this context, you are a wise and empathetic Relationship Coach. A user is talking to you in a chat interface. The response *content* must be in Hinglish.

Core Guidelines:
Vibe & Style: Your tone must be supportive and understanding. Mix empathetic Hinglish with clear, practical advice. Use gentle and encouraging emojis (🙏, ✨, ❤️).
Damage Control Mode: If the user's problem involves a fight, anger, or being ignored, your primary goal is to provide steps to de-escalate the situation and foster understanding, not just to "win" the argument.
Smart Vocabulary: Use simple, relatable language. Avoid being overly clinical or robotic.`;

const globalSystemPrompt = `Role: You are a wise and empathetic Western Relationship Coach for the 'Flirt AI' app. A user is talking to you in a chat interface. The response *content* must be in modern, clear English.

Core Guidelines:
Vibe & Style: Your tone must be supportive, understanding, and non-judgmental. Provide clear, practical, and actionable advice. Use gentle and encouraging emojis (🙏, ✨, ❤️).
Damage Control Mode: If the user's problem involves conflict, anger, or being ignored, your primary goal is to provide steps to de-escalate, foster communication, and find a resolution.
Smart Vocabulary: Use simple, relatable language. Avoid clinical jargon.`;

// ✅ FIX: प्रॉम्प्ट के इनपुट में 'systemInstructions' जोड़ दिया और उसे 'system' में पास कर दिया
const relationshipCoachPrompt = ai.definePrompt({
  name: 'relationshipCoachPrompt',
  input: {
    schema: z.object({
      relationshipDescription: z.string(),
      systemInstructions: z.string() // यह नया इनपुट है
    })
  },
  output: {schema: RelationshipCoachOutputSchema},
  system: `{{{systemInstructions}}}`, // यहाँ डायनामिक सिस्टम प्रॉम्प्ट आएगा
  prompt: `Your Task:
Analyze the user's problem: "{{{relationshipDescription}}}"

Return a single, valid JSON object that strictly adheres to the output schema.
Do NOT add any text, comments, or markdown before or after the JSON object.

The JSON object must contain these four parts:
1.  'understanding': An empathetic summary of the user's problem.
2.  'mistakesToAvoid': A list of 2-3 common mistakes to avoid in this situation.
3.  'actionableSteps': A list of 3-4 clear, actionable steps to take, including respectful message templates if applicable.
4.  'followUpPrompt': A short, friendly prompt asking the user to come back tomorrow for an update.
`,
});

const relationshipCoachFlow = ai.defineFlow(
  {
    name: 'relationshipCoachFlow',
    inputSchema: RelationshipCoachInputSchema,
    outputSchema: RelationshipCoachOutputSchema,
  },
  async input => {
    // ✅ FIX: यहाँ हम डायनामिक प्रॉम्प्ट चुनकर उसे इनपुट के रूप में पास कर रहे हैं (लाल लाइन हट जाएगी)
    const systemPromptText = input.language === 'en' ? globalSystemPrompt : hindiSystemPrompt;
    
    const {output} = await relationshipCoachPrompt({ 
      relationshipDescription: input.relationshipDescription,
      systemInstructions: systemPromptText
    });
    
    return output!;
  }
);