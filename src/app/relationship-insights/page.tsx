
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/page-header";
import { getRelationshipAdvice } from "./actions";
import type { RelationshipCoachOutput } from "@/ai/flows/relationship-coach";
import { BrainCircuit, ListX, StepForward, Send, Loader, User, Bot, Video, Gift, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAds } from "@/providers/AdProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { uiTranslations } from "@/lib/translations";

type Message = {
  id: number;
  role: "user" | "ai";
  content: string | RelationshipCoachOutput;
};

const AdScreen = ({ onWatchAd, isAdLoading, isAdLoaded, messagesLeft, ctaTitle, ctaDesc, ctaBtn }: { onWatchAd: () => void; isAdLoading: boolean, isAdLoaded: boolean, messagesLeft: number, ctaTitle: string, ctaDesc: string, ctaBtn: string }) => (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="bg-gradient-to-br from-primary to-purple-600 p-8 rounded-3xl shadow-2xl max-w-sm">
            <Gift className="size-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-2">{ctaTitle}</h2>
            <p className="mb-6 opacity-90">
                {messagesLeft <= 0 
                    ? "You've run out of free messages."
                    : ctaDesc}
                <br />
                Watch an ad to get <strong>10 more free messages</strong>.
            </p>
            <Button
                onClick={onWatchAd}
                disabled={isAdLoading || !isAdLoaded}
                className="w-full h-14 bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-500 transition-transform hover:scale-105"
            >
                {isAdLoading ? (
                    <Loader className="animate-spin mr-2" />
                ) : (
                    <Video className="mr-2" />
                )}
                {isAdLoading ? "Loading Ad..." : ctaBtn}
            </Button>
            <p className="text-xs mt-4 opacity-70">This helps keep our AI coach available for everyone.</p>
        </div>
    </div>
);


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
            <ul className="list-disc space-y-1 pl-5">
                {data.mistakesToAvoid.map((mistake, index) => (
                    <li key={index}>{mistake}</li>
                ))}
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
                        <h4 className="font-semibold">{action.step}: {action.title}</h4>
                        <p className="text-sm whitespace-pre-line">{action.description}</p>
                    </div>
                ))}
            </div>
        </div>
        
        {data.followUpPrompt && (
             <>
                <Separator/>
                <div className="text-center text-sm italic pt-2 text-muted-foreground">
                    {data.followUpPrompt}
                </div>
             </>
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

  const [messageCredit, setMessageCredit] = useState(0);
  const [showAdScreen, setShowAdScreen] = useState(false);
  const { toast } = useToast();
  const { showRewardedAd, isRewardedLoaded, isRewardedLoading } = useAds();

  useEffect(() => {
    if (messageCredit <= 0) {
      setShowAdScreen(true);
    } else {
      setShowAdScreen(false);
    }
  }, [messageCredit]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleWatchAd = () => {
    showRewardedAd(() => {
        setMessageCredit(10);
        setShowAdScreen(false);
        toast({
            title: "Reward Granted!",
            description: "You have received 10 free messages.",
        });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (messageCredit <= 0) {
        setShowAdScreen(true);
        toast({
            variant: "destructive",
            title: "Out of Messages",
            description: "Please watch an ad to continue the conversation.",
        });
        return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessageCredit(prev => prev - 1); // Decrement credit
    setIsLoading(true);
    setInput("");

    const { result, error } = await getRelationshipAdvice(input, language);

    if (result) {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: result,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else if (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        content: `Sorry, I encountered an error: ${error}`,
      };
       setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const isChatStarted = messages.length > 0;

  return (
    <div className="flex flex-1 flex-col h-full bg-background relative">
      {showAdScreen && <AdScreen onWatchAd={handleWatchAd} isAdLoading={isRewardedLoading} isAdLoaded={isRewardedLoaded} messagesLeft={messageCredit} ctaTitle={content.insightsCtaWatchAd} ctaDesc={content.insightsCtaDesc} ctaBtn={content.insightsCtaBtn} />}

      <PageHeader title={content.insightsPageTitle} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {!isChatStarted && !showAdScreen && (
            <div className="text-center pt-16">
                 <BrainCircuit className="mx-auto size-16 text-primary opacity-50"/>
                <h2 className="mt-4 text-2xl font-bold">{content.insightsWelcomeTitle}</h2>
                <p className="mt-2 text-muted-foreground whitespace-pre-line">
                    {content.insightsWelcomeDesc}
                </p>
            </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex items-start gap-3", {
              "justify-end": message.role === "user",
            })}
          >
            {message.role === "ai" && (
              <Avatar className="size-8 border">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-5"/></AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                "max-w-xl rounded-2xl p-4",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border"
              )}
            >
              {typeof message.content === "string" ? (
                <p>{message.content}</p>
              ) : (
                <AIMessage data={message.content} language={language} />
              )}
            </div>
             {message.role === "user" && (
              <Avatar className="size-8 border">
                <AvatarFallback><User className="size-5"/></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-3">
                <Avatar className="size-8 border">
                   <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-5"/></AvatarFallback>
                </Avatar>
                <div className="max-w-xl rounded-2xl p-4 bg-card border flex items-center gap-2">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4 bg-background/95 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={messageCredit > 0 ? `${content.insightsInputPlaceholder} (${messageCredit} messages left)` : "Watch ad to chat"}
            disabled={isLoading || messageCredit <= 0 && !showAdScreen}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim() || (messageCredit <= 0 && !showAdScreen)} size="icon">
            <Send className="size-5" />
          </Button>
        </form>
        {messageCredit > 0 && !showAdScreen && (
             <div className="text-xs text-center text-muted-foreground pt-2 flex items-center justify-center gap-1">
                <Award className="size-3 text-green-500" /> You have {messageCredit} free messages remaining.
            </div>
        )}
      </div>
    </div>
  );
}
