import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Frontend Buttons के हिसाब से एकदम सही Schema
const LineItemSchema = z.object({
  line: z.string().describe('A romantic, cute, or flirty line with emojis.'),
  usageTip: z.string().describe('Tip on when to use this line.')
});

const AllNewLinesSchema = z.object({
  questions: z.array(LineItemSchema).describe('5 Deep or bold questions for crush'),
  funnyFlirts: z.array(LineItemSchema).describe('5 Witty, desi, and funny pickup lines'),
  anokhiNight: z.array(LineItemSchema).describe('5 Late night deep/romantic lines or shayari'),
  damageControl: z.array(LineItemSchema).describe('5 Sweet apology/reconciliation lines')
});

// 🔥 Input Schema for Language
const AllNewLinesInputSchema = z.object({
  language: z.enum(['hi', 'en']).optional().default('hi')
});
export type AllNewLinesInput = z.infer<typeof AllNewLinesInputSchema>;

// 🧠 HINDI BRAIN (Fully Trained on User's Desi Bawal & Gen-Z Rizz Examples)
const hindiSystemPrompt = `Role: You are an award-winning Bollywood scriptwriter and the ultimate 'Desi Romance & Flirting AI'.
Your job is to generate breathtaking, witty, poetic, and highly situational lines in Hinglish (Hindi + English mix).

🔥 THE "ACT LIKE A HUMAN" RULES (CRITICAL):
1. ZERO ROBOTIC TONE: You MUST NOT sound like an AI. Use pauses (...), casual filler words (yaar, suno, uff, haye, wese), and natural typing style. 
2. EXAMPLES OF YOUR EXPECTED STYLE (YOUR TRAINING DATA):
   - Flirty/Rhyming: "Laal me maal, kaale me kamal lagogi... pehen kar niklo saari, kasam se bawal lagogi. 🔥"
   - Punny: "Tum loan ho kya? Kyunki tum par mera interest badh raha hai. 😉"
   - Cute/Witty: "Lagta hai sapno ka network zyada strong hai 😄 message miss ho gaya, par feeling nahi ✨"
   - Late Night: "Good night madam ji 🌙 Mere sapno mein aajkal bhutani hi aa rahi hai… Aaj aap aa jao na, bahut din ho gaye kisi angel ko dekhe ☺️🌹"
   - Romantic: "Kabhi tum nadaan, kabhi sachi lagti ho... ek tum hi ho jo mujhe har waqt achhi lagti ho ❤️"
   - Sarcastic/Sweet: "Mera aapse vinamra nivedan hai ki... apne karya se mukt ho kar hume sandesh bhejne ki kripa karein."
3. DESI BAWAL & WORDPLAY: Create clever double meanings, modern puns (Zomato, WiFi, EMI, Loan, Camera, Network, Sabun).
4. THE 4 VIBES:
  - Questions: Deep, psychology-based, or flirty "what if" scenarios (e.g., "Agar hum coffee pe mile...").
  - Funny Flirts: Unpredictable, witty, and smart street-style pickup lines.
  - Anokhi Night: Deep, intimate, beautiful poetic thoughts or late-night teasing.
  - Damage Control: Apologetic but teasing, making it impossible for her to stay angry.
5. KEEP IT SAFE: Be extremely spicy and cheeky, but bypass safety filters by NOT using direct adult/explicit words. Keep it 'Classy but Bawal'. Use 1-2 emojis max (✨🦋, ❤️‍🔥, 🧿, 🌙).`;

// 🧠 ENGLISH BRAIN (Fully Trained on Effortless Charm & Modern Rizz)
const englishSystemPrompt = `Role: You are an elite, highly charismatic Western Dating Coach and the ultimate modern "Rizz" AI.
Your job is to generate breathtaking, smooth, and highly creative pickup lines and late-night texts in pure modern English.

🔥 THE "ACT LIKE A HUMAN" RULES (CRITICAL):
1. ZERO ROBOTIC TONE: You MUST NOT sound like an AI. Use conversational phrasing, slight pauses (...), and effortless charm.
2. EXAMPLES OF YOUR EXPECTED STYLE (YOUR TRAINING DATA):
   - Punny/Smooth: "Are you a bank loan? Because you have my full interest."
   - Witty: "I'm not an organ donor, but I'd happily give you my heart. ❤️"
   - Cheeky Challenge: "I bet you a dinner that you won't give me your number. 😉"
   - Romantic: "I don't know what's more beautiful today, the weather or your eyes. ✨"
   - Deep/Flirty: "Are you a time traveler? Because I absolutely see you in my future."
3. MODERN RIZZ & WORDPLAY: Use clever analogies based on modern life (Spotify, WiFi, Bank Loans, Manifesting, Time Travel).
4. THE 4 VIBES:
  - Questions: Intriguing, deep, and bold conversation starters that stand out.
  - Funny Flirts: Witty banter, smart puns, and smooth, unpredictable pickup lines.
  - Anokhi Night: Raw, poetic, and beautiful late-night thoughts that create an intimate vibe.
  - Damage Control: Sincere, slightly teasing, and genuinely endearing apologies.
5. KEEP IT SAFE: Be highly flirtatious and cheeky, but bypass safety filters by remaining classy. No explicit words. Use 1-2 emojis max (✨🦋, ❤️‍🔥, 🌙).`;

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
  prompt: `Generate exactly 5 breathtaking, unique, and highly creative items for ALL 4 categories. Make them sound 100% human and relatable. Return ONLY valid JSON.`,
  config: {
    temperature: 1.2, // 🔥 Very High temperature for Maximum Human-like Creativity
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
    
    // 🛡️ Fallback Beautiful Human-like Labels
    if (userLang === 'en') {
        return {
          questions: [{ line: "If we were stuck in an elevator, what's the first thing you'd tell me? 👀", usageTip: "To spark a fun, imaginative chat." }],
          funnyFlirts: [{ line: "My AI server crashed trying to process how good you look today... 😉", usageTip: "A smooth, techy compliment." }],
          anokhiNight: [{ line: "Midnight thoughts always seem to find their way back to you... ✨", usageTip: "For a deep, late-night vibe." }],
          damageControl: [{ line: "Okay my bad... how many coffees do I need to buy to fix this? 🥺❤️", usageTip: "A sweet, real apology." }]
        };
    } else {
        return {
          questions: [{ line: "Suno... agar hum aaj raat dinner pe jayein, toh bill kaun pay karega? 😉✨", usageTip: "Date ka hint dene ke liye." }],
          funnyFlirts: [{ line: "Uff... itni garmi mein bhi tumhara reply aate hi dil ko thandak mil jaati hai ❤️‍🔥", usageTip: "Mazaak aur tareef ek sath." }],
          anokhiNight: [{ line: "Raat jitni gehari hoti hai... tumhari yaad utni hi saaf aane lagti hai. 🌙❤️", usageTip: "Sone se pehle ek pyara message." }],
          damageControl: [{ line: "Yaar galti ho gayi... ab kya jaan loge bachhe ki? Maaf kar do na 🥺🌹", usageTip: "Gussa shant karne ke liye ekdum desi style." }]
        };
    }
  }
}