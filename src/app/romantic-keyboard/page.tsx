
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { getCommentAction } from './actions';
import { getStoryAnalysisAction } from './story-actions';
import type { SmartCommentOutput } from '@/ai/flows/comment-generator';
import type { StoryAnalyzerOutput } from '@/ai/flows/story-analyzer';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { InstagramIcon } from '@/components/custom-icons';
import { Wand2, Copy, Loader, PartyPopper, Lock, MessageSquare, Mic, Sparkles, Flame } from 'lucide-react';
import { useAds } from '@/providers/AdProvider';
import { useLanguage } from '@/hooks/useLanguage';

const crushMissions = [
  { 
    day: 1, 
    hi_task: "Rule 🎯: Aaj se uski har nayi story ko like karna shuru karo. Consistency is key!", 
    en_task: "Rule 🎯: Start liking every new story she posts from today. Consistency is key!" 
  },
  { 
    day: 2, 
    hi_task: "Attention Grabber 👀: Aaj uski sabse latest photo par like karo.", 
    en_task: "Attention Grabber 👀: Like her most recent photo today." 
  },
  { 
    day: 3, 
    hi_task: "The Bait 🎣: Apni ek badiya si story lagao aur notice karo ki wo seen karti hai ya nahi.", 
    en_task: "The Bait 🎣: Post a good story of yourself and notice if she views it." 
  },
  { 
    day: 4, 
    hi_task: "The Nostalgia Move 🕰️: Uski thodi purani photo par like aur comment karo. Ek perfect comment ke liye 'Comment Generator' tool use karna.", 
    en_task: "The Nostalgia Move 🕰️: Like and comment on one of her older photos. Use the 'Comment Generator' tool to craft the perfect comment." 
  },
  { 
    day: 5, 
    hi_task: "Reminder ⏰: Story daily like karni hai, ye bhoolna mat! Uske notifications mein tumhara naam aana chahiye.", 
    en_task: "Reminder ⏰: Don't forget to like her stories daily! Your name needs to be a familiar sight in her notifications." 
  },
  { 
    day: 6, 
    hi_task: "Highlight Check ✨: Aaj uski 2-3 highlights like karo, par sirf wo wali jisme uski photo ho.", 
    en_task: "Highlight Check ✨: Like 2-3 of her highlights today, but only the ones with her pictures." 
  },
  { 
    day: 7, 
    hi_task: "Test the Waters 🌊: Aaj apni ek best photo story par lagao aur dekho kya uski taraf se like aata hai.", 
    en_task: "Test the Waters 🌊: Post your best picture on your story today and see if she drops a like." 
  },
  { 
    day: 8, 
    hi_task: "The Ghost Rule 👻: Agar kal like nahi aaya, toh 3 din tak puri tarah gayab raho. Na story like karni hai, na apni lagani hai.", 
    en_task: "The Ghost Rule 👻: If she didn't like your story yesterday, ghost completely for 3 days. No liking her stories, no posting your own." 
  },
  { 
    day: 9, 
    hi_task: "Manifestation Day 🧘‍♂️: Aaj koi action nahi. Aankhein band karo aur imagine karo ki agar wo tumhari girlfriend ban gayi, toh tum kahan ghumne jaoge?", 
    en_task: "Manifestation Day 🧘‍♂️: No action today. Close your eyes and imagine: if she becomes your girlfriend, where will you take her?" 
  },
  { 
    day: 10, 
    hi_task: "Late Night Magic 🌙: Raat ko sote waqt socho ki uska message aaya hai aur tumhari 1 ghante se bahut achi baat chal rahi hai. ☺️", 
    en_task: "Late Night Magic 🌙: While falling asleep, imagine she texted you and you've been having an amazing conversation for an hour. ☺️" 
  },
  { 
    day: 11, 
    hi_task: "The Return 👑: Aaj phir se ek story lagao. Agar tum online ho, toh uski story bhi like kar dena taaki use pata chale tum wapas aa gaye ho.", 
    en_task: "The Return 👑: Post an awesome story today. Since you are online, like her story too so she knows you're back." 
  },
  { 
    day: 12, 
    hi_task: "Checkmate Check 🚦: Agar koi response nahi mila, toh Day 1 se repeat karo. Agar thoda bhi interest laga, toh yahan se game aage badhate hain!", 
    en_task: "Checkmate Check 🚦: If there's no response, repeat from Day 1. If you sense even a little interest, it's time to level up!" 
  },
  { 
    day: 13, 
    hi_task: "The Safe DM 📱: Uski aisi story par reply karo jisme uska chehra na ho (jaise khana, view). Ek simple sawal poocho. Ignore hone ka chance 0% hai.", 
    en_task: "The Safe DM 📱: Reply to a story without her face (like food or a view). Ask a simple question. 0% chance of being ignored." 
  },
  { 
    day: 14, 
    hi_task: "React & Retreat 🚶‍♂️: Aaj uski story par sirf ek reaction (😂 ya ❤️) do, par kuch likhna mat. Let her wonder.", 
    en_task: "React & Retreat 🚶‍♂️: Just leave a reaction (😂 or ❤️) on her story today, but don't type anything. Let her wonder." 
  },
  { 
    day: 15, 
    hi_task: "The Brain Teaser 🧠: Aaj baaton mein usse koi opinion maango. Log apni pasand ke bare mein batana bahut pasand karte hain.", 
    en_task: "The Brain Teaser 🧠: Ask for her opinion on something today. People love talking about their preferences." 
  },
  { 
    day: 16, 
    hi_task: "Meme Magic 🎭: Ek aisi reel bhejo jo uski vibe se match karti ho. Likho 'Ye tumhare jaisa kyu lag raha hai 😂'.", 
    en_task: "Meme Magic 🎭: Send her a reel that matches her vibe. Say: 'Why does this remind me of you 😂'." 
  },
  { 
    day: 17, 
    hi_task: "The Cliffhanger 🧗‍♂️: Jab baat sabse mazedaar chal rahi ho, tabhi reply karna chhod do aur bolo 'Thoda busy hu, baad mein batata hu'.", 
    en_task: "The Cliffhanger 🧗‍♂️: Leave the conversation when it's at its peak. Just say, 'Getting a bit busy, I'll tell you later'." 
  },
  { 
    day: 18, 
    hi_task: "Playful Tease 😜: Aaj ki chat mein uski kisi baat par disagree karo ya halke se tease karo. Har baat par haan mat milao.", 
    en_task: "Playful Tease 😜: Gently tease her or playfully disagree with something she says today. Don't be too agreeable." 
  },
  { 
    day: 19, 
    hi_task: "The Inside Joke 🤫: Tumhari picchli baaton mein se kisi ek topic par joke banao. Ye ek secret bond banata hai.", 
    en_task: "The Inside Joke 🤫: Bring up a detail from a past conversation to create an 'inside joke'. This builds a secret bond." 
  },
  { 
    day: 20, 
    hi_task: "The Vibe Check 🎧: Usse koi song ya Netflix series recommend karne ko bolo.", 
    en_task: "The Vibe Check 🎧: Ask her to recommend a song or a Netflix series to watch." 
  },
  { 
    day: 21, 
    hi_task: "Smooth Shift 🏎️: Usne jo recommend kiya tha uska review do, aur baaton baaton mein 'Chat Guide' se ek smooth flirt line try karo.", 
    en_task: "Smooth Shift 🏎️: Review her recommendation, and casually drop a smooth flirting line from the 'Chat Guide'." 
  },
  { 
    day: 22, 
    hi_task: "Pattern Interrupt 🎙️: Aaj text ki jagah ek chhoti aur confident Voice Note bhejo. Awaaz sunkar connection aur strong hota hai.", 
    en_task: "Pattern Interrupt 🎙️: Break the texting pattern today by sending a short, confident Voice Note. Hearing your voice builds connection." 
  },
  { 
    day: 23, 
    hi_task: "Push & Pull 🧲: Pehle compliment do, phir turant tease karo. Jaise: 'Tum cute toh ho, par height baccho wali hai 😆'.", 
    en_task: "Push & Pull 🧲: Compliment her, but immediately tease her. Like: 'You are cute, but you definitely have kid height 😆'." 
  },
  { 
    day: 24, 
    hi_task: "The Assuming Frame 😏: Aise behave karo jaise wo tumpe lattu hai. Bolo: 'Tum mujhe itna kyu ghoorti ho stories mein?'", 
    en_task: "The Assuming Frame 😏: Act as if she is the one crushing on you. Playfully say: 'Why are you always staring at my stories?'" 
  },
  { 
    day: 25, 
    hi_task: "Midnight Deep Talks 🌌: Raat ko ek deep topic par baat shuru karo. 'Chat Guide' se deep questions ka use karo.", 
    en_task: "Midnight Deep Talks 🌌: Start a deep conversation late at night. Use the deep questions from the 'Chat Guide'." 
  },
  { 
    day: 26, 
    hi_task: "The Nickname Effect 🏷️: Uski personality ke hisaab se usko ek cute Nickname do. Ye use special feel karayega.", 
    en_task: "The Nickname Effect 🏷️: Give her a cute nickname based on her personality. This makes her feel special." 
  },
  { 
    day: 27, 
    hi_task: "The Challenge 🚧: Thoda challenge karo. Bolo: 'Humein toh ek dusre se durr rehna chahiye, hum milkar pakka disaster banenge 😂'.", 
    en_task: "The Challenge 🚧: Challenge her playfully. Say: 'We should definitely stay away from each other, we'd be a total disaster 😂'." 
  },
  { 
    day: 28, 
    hi_task: "Future Projection 🔮: Baaton mein hint do jaise, 'Hum jab coffee peene jayenge tab batata hu...'. (Direct mat poocho).", 
    en_task: "Future Projection 🔮: Drop a hint like, 'I'll tell you when we go get coffee...' (Assume the plan, don't ask directly)." 
  },
  { 
    day: 29, 
    hi_task: "The Setup ☕: Uska mood sabse acha ho tab seedha aur confident hokar date ka plan banao. Confidence hi sab kuch hai.", 
    en_task: "The Setup ☕: When her mood is at its best, be direct and confident about setting up a date. Confidence is everything." 
  },
  { 
    day: 30, 
    hi_task: "Mission Complete 🏆: Date par jao aur enjoy karo! Agar baat nahi bani, toh naya target dhoondo, App hamesha saath hai! 😎", 
    en_task: "Mission Complete 🏆: Go on the date and enjoy! If it didn't work out, find a new target. The App is always with you! 😎" 
  }
];

const commentFormSchema = z.object({
  photoDescription: z.string().min(10, { message: "Please provide at least 10 characters for the AI." }),
});

const storyFormSchema = z.object({
  storyDescription: z.string().min(5, "Please describe the story a bit."),
});

function AISubmitButton({ isPending, text = "Generate" }: { isPending: boolean; text?: string; }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90">
      {isPending ? (
        <>
          <Loader className="mr-2 size-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 size-4" />
          {text}
        </>
      )}
    </Button>
  );
}

const useCountdown = () => {
  const [countdown, setCountdown] = useState("24h 00m 00s");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Ready!");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return countdown;
};

const getLevelInfo = (day: number) => {
    if (day <= 7) return { name: "Level 1: The Spark", color: "text-cyan-500" };
    if (day <= 14) return { name: "Level 2: The Connection", color: "text-pink-500" };
    if (day <= 21) return { name: "Level 3: The Deep Bond", color: "text-purple-500" };
    return { name: "Level 4: The Ultimate Lover", color: "text-orange-500" };
};

export default function CrushMissionPage() {
    const { toast } = useToast();
    const { showBanner, hideBanner, showInterstitialAd } = useAds();
    const { language } = useLanguage();
    const [currentDay, setCurrentDay] = useState(1);
    const [completedDays, setCompletedDays] = useState<number[]>([]);
    const [crushDetails, setCrushDetails] = useState({ nature: '', likes: '', hobbies: '', dislikes: '' });
    
    // State for Comment Generator
    const [commentState, setCommentState] = useState<{ result?: SmartCommentOutput; error?: string | object }>({});
    const [isCommentPending, setIsCommentPending] = useState(false);
    const commentForm = useForm<z.infer<typeof commentFormSchema>>({ resolver: zodResolver(commentFormSchema), defaultValues: { photoDescription: "" } });
    
    // State for Story Analyzer
    const [storyState, setStoryState] = useState<{ result?: StoryAnalyzerOutput; error?: string | object }>({});
    const [isStoryPending, setIsStoryPending] = useState(false);
    const storyForm = useForm<z.infer<typeof storyFormSchema>>({ resolver: zodResolver(storyFormSchema), defaultValues: { storyDescription: "" } });

    const countdown = useCountdown();

    useEffect(() => {
        showBanner();
        return () => {
            hideBanner();
        }
    }, [showBanner, hideBanner]);

    useEffect(() => {
        try {
            const savedCompletedDays = localStorage.getItem('crushMission_completedDays');
            const savedCrushDetails = localStorage.getItem('crushMission_crushDetails');
            let savedCurrentDay = localStorage.getItem('crushMission_currentDay');
            const lastCompletionDateStr = localStorage.getItem('crushMission_lastCompletionDate');

            const completed = savedCompletedDays ? JSON.parse(savedCompletedDays) : [];
            setCompletedDays(completed);

            if (savedCrushDetails) {
                setCrushDetails(JSON.parse(savedCrushDetails));
            }

            let day = savedCurrentDay ? JSON.parse(savedCurrentDay) : 1;

            if (lastCompletionDateStr && day < 30 && completed.includes(day)) {
                const lastCompletionDate = new Date(lastCompletionDateStr);
                const now = new Date();
                
                if (now.getFullYear() > lastCompletionDate.getFullYear() || 
                    now.getMonth() > lastCompletionDate.getMonth() || 
                    now.getDate() > lastCompletionDate.getDate()) {
                    
                    day = day + 1;
                }
            }
            
            setCurrentDay(day);
            if (savedCurrentDay !== String(day)) {
                localStorage.setItem('crushMission_currentDay', JSON.stringify(day));
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
    }, []);

    const isTodayCompleted = useMemo(() => completedDays.includes(currentDay), [completedDays, currentDay]);
    const currentMission = useMemo(() => crushMissions.find(m => m.day === currentDay), [currentDay]);
    const progress = useMemo(() => (completedDays.length / 30) * 100, [completedDays]);
    const levelInfo = useMemo(() => getLevelInfo(currentDay), [currentDay]);

    const handleMarkAsDone = () => {
        if (!completedDays.includes(currentDay)) {
            const newCompletedDays = [...completedDays, currentDay];
            setCompletedDays(newCompletedDays);
            localStorage.setItem('crushMission_completedDays', JSON.stringify(newCompletedDays));
            localStorage.setItem('crushMission_lastCompletionDate', new Date().toISOString());
        }
        if(navigator.vibrate) navigator.vibrate(100);
        toast({ title: `Day ${currentDay} Complete!`, description: "Great work! Come back tomorrow for the next mission." });
        showInterstitialAd();
    };
    
    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `Copied ${type}!`, description: "Ready to paste and impress!" });
    };

    const handleSaveDetails = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newDetails = {
            nature: formData.get('nature') as string,
            likes: formData.get('likes') as string,
            hobbies: formData.get('hobbies') as string,
            dislikes: formData.get('dislikes') as string,
        };
        setCrushDetails(newDetails);
        localStorage.setItem('crushMission_crushDetails', JSON.stringify(newDetails));
        toast({ title: "Details Saved!", description: "AI will use this info for better suggestions." });
    };
    
    const userDetailsString = useMemo(() => `Nature: ${crushDetails.nature}, Likes: ${crushDetails.likes}, Hobbies: ${crushDetails.hobbies}`, [crushDetails]);

    const onCommentSubmit = async (data: z.infer<typeof commentFormSchema>) => {
        setIsCommentPending(true);
        setCommentState({});
        const { result, error } = await getCommentAction({ ...data, language });
        if (error && typeof error !== 'string') {
            const fieldErrors = error as any;
            if (fieldErrors.photoDescription) commentForm.setError("photoDescription", { type: "server", message: fieldErrors.photoDescription[0] });
        }
        setCommentState({ result, error });
        setIsCommentPending(false);
    };

    const onStorySubmit = async (data: z.infer<typeof storyFormSchema>) => {
        setIsStoryPending(true);
        setStoryState({});
        const { result, error } = await getStoryAnalysisAction({ ...data, userDetails: userDetailsString, language });
        if (error && typeof error !== 'string') {
            const fieldErrors = error as any;
            if (fieldErrors.storyDescription) storyForm.setError("storyDescription", { type: "server", message: fieldErrors.storyDescription[0] });
        }
        setStoryState({ result, error });
        setIsStoryPending(false);
    };

    if (!currentMission) return <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-800">Loading Mission...</div>;

    if (completedDays.length === 30 && currentDay === 30 && isTodayCompleted) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
                <PartyPopper className="size-24 text-yellow-400 animate-pulse" />
                <h1 className="mt-6 text-4xl font-bold text-gray-800 font-cursive">Mission Accomplished!</h1>
                <p className="mt-2 text-gray-600">You've successfully completed the 30-Day Crush Mission.</p>
                <p className="mt-1 text-lg font-bold text-yellow-500">You are now a "Legendary Lover"!</p>
                <Button className="mt-8 bg-gradient-to-r from-pink-500 to-orange-500 text-white">Share Success</Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-body text-gray-900">
            <main className="flex-1 space-y-6 overflow-y-auto p-4 pb-56">
                <div className="text-center space-y-2">
                    <p className={cn("font-semibold", levelInfo.color)}>{levelInfo.name}</p>
                    <p className="font-bold text-lg">Day {String(currentDay).padStart(2, '0')} of 30 <Flame className="inline size-5 text-orange-400" /></p>
                    <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-orange-500" />
                    <p className="text-xs text-gray-500">Next Mission Unlocks in {countdown}</p>
                </div>

                <div className="relative p-0.5 rounded-[28px] bg-gradient-to-b from-cyan-400/50 via-pink-500/50 to-purple-600/50 shadow-lg">
                    <div className="bg-white text-gray-900 rounded-[26px] p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                             <p className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded-md">TODAY'S BIG TASK</p>
                             <h2 className="text-2xl font-extrabold text-gray-900 mt-1">DAY {String(currentDay).padStart(2, '0')}</h2>
                           </div>
                           <Mic className="size-5 text-gray-400" />
                        </div>
                        <p className="text-base text-gray-700">{language === 'hi' ? currentMission.hi_task : currentMission.en_task}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <Link href="/community">
                        <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="flex items-center justify-center size-20 rounded-2xl border bg-white shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1">
                                <MessageSquare className="size-8 text-cyan-500" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600">Daily Comment</p>
                        </div>
                    </Link>

                    <Dialog>
                       <DialogTrigger asChild>
                         <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="flex items-center justify-center size-20 rounded-2xl border bg-white shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1">
                                <InstagramIcon className="size-8" />
                            </div>
                            <p className="text-xs font-semibold text-gray-600">Story Tip</p>
                        </div>
                       </DialogTrigger>
                       <DialogContent>
                         <DialogHeader>
                            <DialogTitle>AI Story Analyzer</DialogTitle>
                            <DialogDescription>Describe their story, and I'll suggest a clever reply.</DialogDescription>
                         </DialogHeader>
                         <Form {...storyForm}>
                            <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="space-y-4">
                                <FormField control={storyForm.control} name="storyDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Story Description</FormLabel>
                                        <FormControl><Textarea placeholder="e.g., 'She is at a cafe with a cute dog.'" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <AISubmitButton isPending={isStoryPending} text="Analyze Story" />
                            </form>
                         </Form>
                         {storyState.result && (
                            <div className="mt-4 space-y-4">
                                <h4 className="font-semibold">Here's a suggestion:</h4>
                                <div className="rounded-lg bg-slate-100 p-3">
                                    <p className="text-sm font-bold">Observation:</p>
                                    <p className="text-sm text-slate-600 mb-2">{storyState.result.observation}</p>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(storyState.result!.observation, 'Observation')} className="w-full justify-start p-1 h-auto"><Copy className="size-3 mr-2" /> Copy Observation</Button>
                                </div>
                                <div className="rounded-lg bg-slate-100 p-3">
                                    <p className="text-sm font-bold">Question to ask:</p>
                                    <p className="text-sm text-slate-600 mb-2">{storyState.result.question}</p>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(storyState.result!.question, 'Question')} className="w-full justify-start p-1 h-auto"><Copy className="size-3 mr-2" /> Copy Question</Button>
                                </div>
                            </div>
                         )}
                       </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="flex items-center justify-center size-20 rounded-2xl border bg-white shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-1">
                                    <Lock className="size-8 text-purple-500" />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">Update Vault</p>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                           <DialogHeader>
                                <DialogTitle>Add Crush's Details</DialogTitle>
                                <DialogDescription>This info helps the AI give better advice.</DialogDescription>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={handleSaveDetails}>
                                <div className="space-y-2">
                                    <Label htmlFor="nature">Nature</Label>
                                    <Input id="nature" name="nature" defaultValue={crushDetails.nature} placeholder="e.g., Funny, serious, shy..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="likes">Likes</Label>
                                    <Input id="likes" name="likes" defaultValue={crushDetails.likes} placeholder="e.g., Coffee, dogs, travel..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hobbies">Hobbies</Label>
                                    <Input id="hobbies" name="hobbies" defaultValue={crushDetails.hobbies} placeholder="e.g., Reading, painting, hiking..." />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save Details</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-10 p-4 space-y-3 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent">
                 <Button 
                    onClick={handleMarkAsDone} 
                    disabled={isTodayCompleted}
                    className={cn(
                        "w-full h-14 rounded-full text-lg font-bold text-white shadow-lg transition-all",
                        isTodayCompleted 
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-pink-500 to-blue-500 hover:scale-105"
                    )}
                >
                    {isTodayCompleted ? "Completed! Check back tomorrow" : "Mark as Done"}
                </Button>
                <div className="relative text-center p-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-900/70" />
                    <p className="font-cursive text-base italic text-gray-900 font-semibold">"आपकी मुस्कुराहट आपको सबसे खूबसूरत बनाती है मुस्कुराते रहिए"</p>
                    <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-900/70" />
                </div>
            </footer>
        </div>
    );
}
