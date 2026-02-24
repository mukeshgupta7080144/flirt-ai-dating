'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye, Clock, Heart, Shield, User } from "lucide-react";
import { RoadmapItem } from './components/roadmap-item';

const roadmapData = [
    // Phase 1
    {
        icon: MessageCircle,
        title: "Communication",
        tip: "Suno zyada, bolo kam.",
        advice: "Active listening resolves conflicts faster than speaking. Understand your partner's perspective before you respond. It shows you care about their feelings more than winning an argument.",
        actionText: "Task: Ask your partner about their day and listen for 5 minutes without interrupting.",
        iconColor: "text-teal-500"
    },
    {
        icon: Eye,
        title: "Transparency",
        tip: "Choti baatein na chhupayein.",
        advice: "Trust builds on honesty, even in small things. Being an open book about your feelings and daily life fosters a secure environment where your partner feels valued and included.",
        actionText: "Task: Share something about your day you normally wouldn't.",
        iconColor: "text-amber-500"
    },
    // Phase 2
    {
        icon: Clock,
        title: "Quality Time",
        tip: "Bina phone ke 15 minute daily.",
        advice: "Undistracted time is the highest form of affection. Put your phones away and give each other your full attention, even if it's just for a few minutes. It makes your partner feel like a priority.",
        actionText: "Task: Aaj saath mein ek sunset dekhein, bina phone ke.",
        iconColor: "text-blue-500"
    },
    {
        icon: Heart,
        title: "Appreciation",
        tip: "Roz ek choti tareef.",
        advice: "A small compliment can make a huge impact. Acknowledge their efforts, looks, or just their presence in your life. It shows you don't take them for granted.",
        actionText: "Task: Compliment your partner on something you genuinely appreciate about them.",
        iconColor: "text-pink-500"
    },
    // Phase 3
    {
        icon: Shield,
        title: "Conflict Resolution",
        tip: "Galti maanne mein chote nahi bante.",
        advice: "Ego has no place in a healthy relationship. Admitting your mistake and apologizing sincerely is a sign of strength and respect for your partner and the relationship.",
        actionText: "Task: Next time you're wrong, apologize without adding a 'but...'.",
        iconColor: "text-red-500"
    },
    {
        icon: User,
        title: "Personal Space",
        tip: "Rishtey mein 'Me Time' bhi zaruri hai.",
        advice: "Being a couple doesn't mean losing your individuality. Giving each other space for personal hobbies and friendships makes the time you spend together even more special.",
        actionText: "Task: Encourage your partner to spend some time on their own hobby.",
        iconColor: "text-purple-500"
    },
];

export default function LoveCompassPage() {
    const [appliedStops, setAppliedStops] = useState<number[]>([]);

    useEffect(() => {
        try {
            const savedStops = localStorage.getItem('loveCompass_appliedStops');
            if (savedStops) {
                setAppliedStops(JSON.parse(savedStops));
            }
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
    }, []);

    const handleApply = (index: number) => {
        if (!appliedStops.includes(index)) {
            const newAppliedStops = [...appliedStops, index];
            setAppliedStops(newAppliedStops);
            try {
                localStorage.setItem('loveCompass_appliedStops', JSON.stringify(newAppliedStops));
            } catch (error) {
                console.error("Failed to write to localStorage:", error);
            }
        }
    };
    
    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-purple-50/50 via-blue-50/50 to-white">
            <PageHeader title="Love Compass" />
            <div className="flex-1 space-y-4 p-4 md:p-6">
                <div className="text-center mb-8">
                    <Badge variant="outline" className="mb-2 border-gray-300 bg-white">
                        Curated by Relationship Experts
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-800">The Relationship Roadmap</h2>
                    <p className="text-muted-foreground mt-1">Your guide to a stronger, healthier bond.</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {roadmapData.map((item, index) => {
                         const phaseIndex = index < 2 ? 1 : index < 4 ? 2 : 3;
                         const phaseTitle = phaseIndex === 1 ? "The Foundation" : phaseIndex === 2 ? "The Bonding" : "Handling Storms";
                         const showPhaseHeader = index === 0 || index === 2 || index === 4;

                         return (
                             <div key={index}>
                                 {showPhaseHeader && (
                                     <div className="mb-4 mt-6 first:mt-0">
                                         <h3 className="text-xs font-bold uppercase text-primary tracking-widest">Phase {phaseIndex}</h3>
                                         <h2 className="text-xl font-bold text-gray-700">{phaseTitle}</h2>
                                     </div>
                                 )}
                                 <RoadmapItem
                                     icon={item.icon}
                                     title={item.title}
                                     tip={item.tip}
                                     advice={item.advice}
                                     actionText={item.actionText}
                                     isLast={index === roadmapData.length - 1}
                                     isUnlocked={index === 0 || appliedStops.includes(index - 1)}
                                     onApply={() => handleApply(index)}
                                     isApplied={appliedStops.includes(index)}
                                     iconColor={item.iconColor}
                                 />
                             </div>
                         );
                    })}
                </div>
            </div>
        </div>
    );
}
