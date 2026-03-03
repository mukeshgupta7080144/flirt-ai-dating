"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/page-header";

import type { RelationshipCoachOutput } from "@/ai/flows/relationship-coach";
import { BrainCircuit, ListX, StepForward, Send, Loader, User, Bot, Gift, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAds } from "@/providers/AdProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { uiTranslations } from "@/lib/translations";
import { callAI } from "@/lib/api-client";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string | RelationshipCoachOutput;
};

const AIMessage = ({ data, language }: { data: RelationshipCoachOutput, language: 'hi' | 'en' }) => (
    <div className="space-y-4 text-foreground/90">
        <div>
            <div className="flex items-center gap-2 font-bold mb-1 text-primary">
                <BrainCircuit className="size-5" />
                <h3>{language === 'hi' ? "AI Ki Samajh" : "AI's Understanding"}</h3>
            </div>
            <p>{data.understanding}</p>
        </div>
        <Separator />
        <div>
            <div className="flex items-center gap-2 font-bold mb-1 text-destructive">
                <ListX className="size-5" />
                <h3>{language === 'hi' ? "Kya Na Karein ❌" : "Mistakes to Avoid"}</h3>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
                {data.mistakesToAvoid.map((mistake, index) => <li key={index}>{mistake}</li>)}
            </ul>
        </div>
        <Separator />
        <div>
            <div className="flex items-center gap-2 font-bold mb-1 text-green-600">
                <StepForward className="size-5" />
                <h3>{language === 'hi' ? "Kya Karein ✔️" : "Actionable Steps"}</h3>
            </div>
            <div className="space-y-3">
                {data.actionableSteps.map((action, index) => (
                    <div key={index}>
                        <h4 className="font-semibold text-sm">{action.step}: {action.title}</h4>
                        <p className="text-xs whitespace-pre-line text-muted-foreground">{action.description}</p>
                    </div>
                ))}
            </div>
        </div>
        {data.followUpPrompt && (
             <div className="text-center text-[10px] italic pt-2 text-muted-foreground border-t border-dashed">
                {data.followUpPrompt}
             </div>
        )}
    </div>
);

export default function RelationshipChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const content = useMemo(() => uiTranslations[language], [language]);

  // ✅ FIX: शुरुआत में 0 क्रेडिट कर दिए हैं ताकि बिना ऐड देखे कोई चैट न कर सके
  const [messageCredit, setMessageCredit] = useState(0); 
  const [isClickLoading, setIsClickLoading] = useState(false);
  
  const { toast } = useToast();
  const { showRewardedAd, isRewardedLoaded } = useAds();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 🎁 ADD: ऐड देखने पर 5 मैसेज देने वाला लॉजिक
  const handleWatchAd = () => {
    setIsClickLoading(true);
    
    if (!isRewardedLoaded) {
        toast({ 
            variant: "destructive", 
            title: "Ad Not Ready", 
            description: "Ad load ho raha hai... thoda wait karein." 
        });
        setIsClickLoading(false);
        return; 
    }

    showRewardedAd(() => {
        setMessageCredit(5); // ✅ 5 नए चैट क्रेडिट्स दे दिए
        setIsClickLoading(false);
        toast({ 
            title: "Unlocked! 🎉", 
            description: "Aapko 5 free messages mil gaye hain. Chat shuru karein!" 
        });
    });

    setTimeout(() => setIsClickLoading(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // सेफ्टी चेक: अगर क्रेडिट नहीं है तो वापस भेज दो
    if (messageCredit <= 0) return;

    const userMessage: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setMessageCredit(prev => prev - 1); // 1 क्रेडिट काट लिया
    setIsLoading(true);
    const currentInput = input;
    setInput("");

    try {
        const data = await callAI("relationship", { 
            relationshipDescription: currentInput, 
            language: language 
        });

        if (data.result) {
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", content: data.result }]);
        } else {
            throw new Error(data.error || "AI failed to respond");
        }
    } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message || "Network Error" });
        setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
        setMessageCredit(prev => prev + 1); // फेल होने पर क्रेडिट वापस कर दिया
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background relative">
      <PageHeader title={content.insightsPageTitle} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
            <div className="text-center pt-16">
                <BrainCircuit className="mx-auto size-16 text-primary opacity-50"/>
                <h2 className="mt-4 text-2xl font-bold">{content.insightsWelcomeTitle}</h2>
                <p className="mt-2 text-muted-foreground whitespace-pre-line text-sm">
                    {content.insightsWelcomeDesc}
                </p>
            </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={cn("flex items-start gap-3", { "justify-end": message.role === "user" })}>
            {message.role === "ai" && <Avatar className="size-8 border shadow-sm"><AvatarFallback className="bg-gray-800 text-white"><Bot className="size-5"/></AvatarFallback></Avatar>}
            <div className={cn("max-w-[85%] rounded-2xl p-4 shadow-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border")}>
              {typeof message.content === "string" ? <p className="text-sm">{message.content}</p> : <AIMessage data={message.content} language={language} />}
            </div>
             {message.role === "user" && <Avatar className="size-8 border shadow-sm"><AvatarFallback className="bg-blue-100 text-blue-600"><User className="size-5"/></AvatarFallback></Avatar>}
          </div>
        ))}
        {isLoading && <div className="flex items-start gap-3"><Avatar className="size-8 border"><AvatarFallback className="bg-gray-800 text-white"><Bot className="size-5"/></AvatarFallback></Avatar><div className="p-3 bg-card border rounded-2xl flex items-center gap-2 shadow-sm"><Loader className="size-4 animate-spin text-gray-400" /><span className="text-sm text-gray-400">Thinking...</span></div></div>}
        <div ref={messagesEndRef} />
      </div>

      {/* 🛑 BOTTOM INPUT AREA LOGIC 🛑 */}
      <div className="border-t p-4 bg-background/95 backdrop-blur-md sticky bottom-0">
        <div className="max-w-4xl mx-auto">
            
            {/* अगर क्रेडिट 0 है, तो इनपुट की जगह 'Unlock' बटन दिखाओ */}
            {messageCredit <= 0 ? (
                <Button
                    onClick={handleWatchAd}
                    disabled={isClickLoading}
                    className="w-full h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-extrabold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg rounded-2xl"
                >
                    {isClickLoading ? <Loader className="animate-spin mr-2" /> : <Gift className="mr-2 size-6" />}
                    {isClickLoading ? "Loading Ad..." : "Watch Ad to Unlock 5 Chats 🎁"}
                </Button>
            ) : (
                /* अगर क्रेडिट है, तो नॉर्मल चैट बॉक्स दिखाओ */
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={content.insightsInputPlaceholder}
                        disabled={isLoading}
                        className="flex-1 rounded-xl h-12"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-12 w-12 rounded-xl">
                        <Send className="size-5" />
                    </Button>
                </form>
            )}

            {/* बचे हुए मैसेज का काउंटर */}
            {messageCredit > 0 && (
                <div className="text-[10px] font-bold text-center text-muted-foreground pt-3 flex items-center justify-center gap-1 uppercase tracking-widest">
                    <Award className="size-3 text-green-500" /> 
                    {messageCredit} MESSAGES LEFT
                </div>
            )}
        </div>
      </div>
    </div>
  );
}