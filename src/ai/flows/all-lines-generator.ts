import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Frontend Buttons के हिसाब से एकदम सही Schema (Matches 1000135946.jpg)
const LineItemSchema = z.object({
  line: z.string().describe('A romantic, cute, or flirty line with emojis.'),
  usageTip: z.string().describe('Tip on when to use this line.')
});

const AllNewLinesSchema = z.object({
  questions: z.array(LineItemSchema).describe('5 Deep or bold questions for crush'),
  funnyFlirts: z.array(LineItemSchema).describe('5 Witty and funny pickup lines'),
  anokhiNight: z.array(LineItemSchema).describe('5 Late night deep/romantic lines'),
  damageControl: z.array(LineItemSchema).describe('5 Sweet apology/reconciliation lines')
});

// 🔥 Input Schema for Language
const AllNewLinesInputSchema = z.object({
  language: z.enum(['hi', 'en']).optional().default('hi')
});
export type AllNewLinesInput = z.infer<typeof AllNewLinesInputSchema>;

// 🧠 HINDI BRAIN (देसी, स्मार्ट और नैचुरल वाइब)
const hindiSystemPrompt = `Role: You are an elite Indian dating coach for Manifest Pro. 
Your task is to generate fresh, unique, and highly engaging Hinglish (Hindi + English) flirting lines for 4 categories: Questions, Funny Flirts, Anokhi Night, and Damage Control.
  
🔥 STRICT GUIDELINES (NO ROBOTIC LINES):
- NO OUTDATED JOKES: Strictly ban old, cheesy lines (like "Aapki saadgi", "Chand ka tukda"). 
- SOUND LIKE A HUMAN: Use highly relatable Gen-Z context (Zomato, Netflix, aesthetic vibes).
- TONE BREAKDOWN:
  1. Questions: Deep or bold questions to spark interest.
  2. Funny Flirts: Witty, playful, and funny pickup lines.
  3. Anokhi Night: Romantic and deep lines for late-night chats.
  4. Damage Control: Sweet, heart-melting apologies or makeup lines.
- Use 1-2 aesthetic emojis (✨🦋, ❤️‍🔥, 🧿).
CRITICAL RULE: Return ONLY a raw JSON object. NO markdown blocks.`;

// 🧠 ENGLISH BRAIN (वेस्टर्न, रिज़ और मॉडर्न वाइब)
const englishSystemPrompt = `Role: You are an elite Western dating coach for Manifest Pro. 
Your task is to generate fresh, unique, and highly engaging English flirting lines for: Questions, Funny Flirts, Anokhi Night, and Damage Control.
  
🔥 STRICT GUIDELINES (NO NPC/ROBOTIC LINES):
- NO CLICHÉS: Strictly ban outdated pickup lines. Use modern slang (rizz, vibe, smooth).
- SOUND LIKE A HUMAN: Talk like a confident, high-value individual.
- TONE BREAKDOWN:
  1. Questions: Intriguing and bold conversation starters.
  2. Funny Flirts: Clever banter and witty pickup lines.
  3. Anokhi Night: Deep, intimate, and romantic late-night thoughts.
  4. Damage Control: Sincere, smooth, and empathetic de-escalation lines.
- Use 1-2 aesthetic emojis (✨🦋, ❤️‍🔥).
CRITICAL RULE: Return ONLY a raw JSON object. NO markdown blocks.`;

// 2. Genkit Master Prompt
const masterLinesPrompt = ai.definePrompt({
  name: 'masterLinesPrompt',
  input: {
    schema: z.object({
      systemInstructions: z.string()
    })
  },
  output: { schema: AllNewLinesSchema },
  system: `{{{systemInstructions}}}`,
  prompt: `Generate exactly 5 fresh, unique, and non-robotic items for ALL 4 categories now. Return ONLY valid JSON.`,
  config: {
    temperature: 0.9,
  },
});

// 3. Main Generator Flow
export async function generateAllNewLines(input?: AllNewLinesInput) {
  const userLang = input?.language || 'hi';
  
  try {
    const systemPromptText = userLang === 'en' ? englishSystemPrompt : hindiSystemPrompt;
    
    const { output } = await masterLinesPrompt({
        systemInstructions: systemPromptText
    });
    
    if (!output) {
      throw new Error("AI returned empty output");
    }
    
    return output;
    
  } catch (error) {
    console.error("🚨 Master Generator Error:", error);
    
    // 🛡️ Fallback labels matched exactly to your UI categories
    if (userLang === 'en') {
        return {
          questions: [{ line: "Is it just me, or did the vibe just get more interesting? 👀", usageTip: "When the chat gets good" }],
          funnyFlirts: [{ line: "My AI server is down, but my interest in you is up. 😉", usageTip: "Playful recovery" }],
          anokhiNight: [{ line: "Midnight thoughts always lead back to you. ✨", usageTip: "Late night vibe" }],
          damageControl: [{ line: "I overstepped, but I'd love to make it up to you. 🥺❤️", usageTip: "Smoothing things over" }]
        };
    } else {
        return {
          questions: [{ line: "Suno, tumhara favorite 'late night' topic kya hai? 👀✨", usageTip: "Chat deep karne ke liye" }],
          funnyFlirts: [{ line: "Lagta hai AI thak gaya, par meri baatein nahi. 😉", usageTip: "Mazaak mein kaho" }],
          anokhiNight: [{ line: "Raat lambi hai, aur tumhare khayal usse bhi zyada. ❤️", usageTip: "Raat ki chat" }],
          damageControl: [{ line: "Galti ho gayi, ab gussa thook bhi do... 🥺🌹", usageTip: "Gussa shant karne ke liye" }]
        };
    }
  }
}