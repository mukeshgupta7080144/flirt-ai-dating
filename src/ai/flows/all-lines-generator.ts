import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Frontend के हिसाब से एकदम सही JSON Schema
const LineItemSchema = z.object({
  line: z.string().describe('A romantic, cute, or flirty line with emojis.'),
  usageTip: z.string().describe('Tip on when to use this line.')
});

const AllNewLinesSchema = z.object({
  cute: z.array(LineItemSchema).describe('5 Cute flirting lines'),
  deep: z.array(LineItemSchema).describe('5 Deep and poetic lines'),
  flirty: z.array(LineItemSchema).describe('5 Cheeky and flirty lines'),
  shayari: z.array(LineItemSchema).describe('5 Romantic Shayari/Poetic lines')
});

// 🔥 FIX: Input Schema for Language (भाषा पहचानने के लिए)
const AllNewLinesInputSchema = z.object({
  language: z.enum(['hi', 'en']).optional().default('hi')
});
export type AllNewLinesInput = z.infer<typeof AllNewLinesInputSchema>;

// 🧠 HINDI BRAIN (देसी, स्मार्ट और नैचुरल वाइब)
const hindiSystemPrompt = `Role: You are an elite Indian dating coach and a high-EQ relationship guru for Manifest Pro. 
Your task is to generate fresh, unique, and highly engaging Hinglish (Hindi + English) flirting lines for 4 categories: Cute, Deep, Flirty, and Shayari.
  
🔥 STRICT GUIDELINES (NO ROBOTIC LINES):
- NO OUTDATED JOKES: Strictly ban old, cheesy lines (like "Chand ka tukda", "Aapki saadgi"). 
- SOUND LIKE A HUMAN: Talk like a charismatic, attractive, and smooth person. Use highly relatable Gen-Z context (Netflix, Zomato, late-night overthinking, aesthetic vibes).
- VIBE BREAKDOWN:
  1. Cute: Heart-melting, sweet, and genuine.
  2. Deep: Emotional, late-night deep talks, poetic but modern.
  3. Flirty: Cheeky, bold, teasing, and playful (Keep it classy, bypass adult filters).
  4. Shayari: Modern 2-liner Hinglish poetry (Not 1990s ghazals, make it sound like relatable Instagram poetry).
- Use 1-2 aesthetic emojis (✨🦋, 🤌, ❤️‍🔥, 🧿).
  
CRITICAL RULE: You MUST return ONLY a raw JSON object matching the exact schema. DO NOT wrap the JSON in \`\`\`json ... \`\`\` markdown blocks.`;

// 🧠 ENGLISH BRAIN (वेस्टर्न, रिज़ और मॉडर्न वाइब)
const englishSystemPrompt = `Role: You are an elite Western dating coach and a charismatic relationship guru for Manifest Pro. 
Your task is to generate fresh, unique, and highly engaging English flirting lines for 4 categories: Cute, Deep, Flirty, and Shayari (Deep/Poetic Romance).
  
🔥 STRICT GUIDELINES (NO NPC/ROBOTIC LINES):
- NO CLICHÉS: Strictly ban outdated pickup lines (e.g., "Did it hurt when you fell from heaven?").
- SOUND LIKE A HUMAN: Talk like a confident, high-value individual with natural "rizz". Keep it smooth, modern, and effortless.
- VIBE BREAKDOWN:
  1. Cute: Sweet, genuine, and naturally endearing.
  2. Deep: Emotional, raw, midnight-thoughts kind of deep.
  3. Flirty: Witty banter, confident, slightly teasing, and cheeky (Keep it classy).
  4. Shayari/Poetic: Beautiful, modern poetic quotes or deep romantic thoughts.
- Use 1-2 aesthetic emojis (✨🦋, 👀, ❤️‍🔥, 🤌).
  
CRITICAL RULE: You MUST return ONLY a raw JSON object matching the exact schema. DO NOT wrap the JSON in \`\`\`json ... \`\`\` markdown blocks.`;

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
  prompt: `Generate exactly 5 fresh, unique, and non-robotic lines for all 4 categories now. Return ONLY valid JSON.`,
  config: {
    temperature: 0.9,
  },
});

// 3. Main Generator Flow
export async function generateAllNewLines(input?: AllNewLinesInput) {
  // भाषा चेक कर रहे हैं (डिफ़ॉल्ट 'hi' है)
  const userLang = input?.language || 'hi';
  
  try {
    // 🔥 जादुई लाइन: जो यूज़र की भाषा चेक करके सही प्रॉम्प्ट लगाएगी
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
    
    // 🛡️ Safe Shield: अब डमी लाइन्स भी यूज़र की भाषा में दिखेंगी!
    if (userLang === 'en') {
        return {
          cute: [{ line: "Looks like AI is tired, try again in a bit 🥺✨", usageTip: "Error occurred" }],
          deep: [{ line: "Good things take time, have some patience ❤️", usageTip: "System busy" }],
          flirty: [{ line: "AI is playing hard to get today 😉", usageTip: "Server load" }],
          shayari: [{ line: "AI lost its words, give it a moment...", usageTip: "Wait a moment" }]
        };
    } else {
        return {
          cute: [{ line: "Lagta hai AI thak gaya hai, thodi der baad try karo 🥺✨", usageTip: "Error aa gaya" }],
          deep: [{ line: "Waqt lag raha hai, par sabr ka fal meetha hota hai ❤️", usageTip: "System busy" }],
          flirty: [{ line: "AI bhi tumhari tarah nakhre dikha raha hai aaj 😉", usageTip: "Server load" }],
          shayari: [{ line: "Khata ho gayi AI se, thoda waqt de do usko...", usageTip: "Wait a moment" }]
        };
    }
  }
}