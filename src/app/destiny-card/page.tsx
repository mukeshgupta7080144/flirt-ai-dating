"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import PageHeader from "@/components/page-header";
import { Bot, Copy, Loader, Sparkles, Send, User, Lightbulb, Award, Video, Gift } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAds } from '@/providers/AdProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';
// 🔐 मास्टर API मैनेजर को यहाँ इम्पोर्ट किया
import { callAI } from '@/lib/api-client';

const replyFormSchema = z.object({
  lastMessage: z.string().min(1, { message: "Please enter the message." }),
});

type Message = {
  id: number;
  role: "user" | "ai";
  content: any;
};

const AdScreen = ({ onWatchAd, isButtonLoading, messagesLeft, ctaTitle, ctaDesc, ctaBtn }: any) => (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="bg-gradient-to-br from-primary to-purple-600 p-8 rounded-3xl shadow-2xl max-w-sm">
            <Gift className="size-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-2">{ctaTitle}</h2>
            <p className="mb-6 opacity-90">
                {messagesLeft <= 0 ? "You've run out of free messages." : ctaDesc}
                <br />
                Watch an ad to get <strong>10 more free messages</strong>.
            </p>
            <Button
                onClick={onWatchAd}
                disabled={isButtonLoading}
                className="w-full h-14 bg-yellow-400 text-black font-bold text-lg hover:bg-yellow-500 transition-transform hover:scale-105"
            >
                {isButtonLoading ? <Loader className="animate-spin mr-2" /> : <Video className="mr-2" />}
                {isButtonLoading ? "Loading..." : ctaBtn}
            </Button>
        </div>
    </div>
);

function ReplySuggestion({ title, text, onCopy }: any) {
    const Icon = title === 'Funny' ? '🤣' : title === 'Caring' ? '🥰' : '😏';
    return (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-sm mt-2">
            <CardContent className="p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-sm text-gray-800">{Icon} {title}</p>
                        <p className="text-gray-700 mt-1 text-sm">{text}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onCopy(text)}>
                        <Copy className="size-4 text-gray-500" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ChatGuidePage() {
    const { toast } = useToast();
    const { showRewardedAd, isRewardedLoaded } = useAds();
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);
    const form = useForm<z.infer<typeof replyFormSchema>>({ 
        resolver: zodResolver(replyFormSchema), 
        defaultValues: { lastMessage: "" } 
    });
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationStarter, setConversationStarter] = useState<string | null>(null);
    const [isStarterLoading, setIsStarterLoading] = useState(false);
    const [messageCredit, setMessageCredit] = useState(5); // Initial free credits
    const [showAdScreen, setShowAdScreen] = useState(false);
    const [isAdButtonClick, setIsAdButtonClick] = useState(false);

    useEffect(() => {
        if (messageCredit <= 0) setShowAdScreen(true);
        else setShowAdScreen(false);
    }, [messageCredit]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ title: content.toastCopiedTitle, description: content.toastCopiedDescription });
    };
    
    // ✅ FIX: Starter के लिए मास्टर API का उपयोग
    const handleNewConversation = async () => {
        setIsStarterLoading(true);
        try {
            const data = await callAI("newLine"); // Assuming 'newLine' flow gives a starter
            if (data.result) setConversationStarter(data.result.line);
        } catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not fetch starter." });
        } finally {
            setIsStarterLoading(false);
        }
    };

    const handleWatchAd = () => {
        setIsAdButtonClick(true);
        if (!isRewardedLoaded) {
            toast({ title: "Ad loading...", description: "Please wait a few seconds." });
            setIsAdButtonClick(false);
            return;
        }
        showRewardedAd(() => {
            setMessageCredit(10);
            setShowAdScreen(false);
            setIsAdButtonClick(false);
            toast({ title: "Reward Granted!", description: "10 free messages added." });
        });
        setTimeout(() => setIsAdButtonClick(false), 5000);
    };

    // ✅ FIX: Reply के लिए मास्टर API (callAI) का उपयोग
    const onSubmit = async (data: z.infer<typeof replyFormSchema>) => {
        const { lastMessage } = data;
        if (!lastMessage.trim() || isLoading) return;

        if (messageCredit <= 0) {
            setShowAdScreen(true);
            return;
        }

        const userMessage: Message = { id: Date.now(), role: 'user', content: lastMessage };
        setMessages((prev) => [...prev, userMessage]);
        setMessageCredit((prev) => prev - 1);
        setIsLoading(true);
        form.reset();

        try {
            const resData = await callAI("reply", { 
                lastMessage: lastMessage, 
                language: language 
            });

            if (resData.result) {
                setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ai", content: resData.result }]);
            } else {
                throw new Error(resData.error || "AI failed to respond");
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || "Failed to get reply" });
            setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
            setMessageCredit((prev) => prev + 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-gray-50 to-blue-50 relative">
            {showAdScreen && <AdScreen onWatchAd={handleWatchAd} isButtonLoading={isAdButtonClick} messagesLeft={messageCredit} ctaTitle={content.destinyCardCtaWatchAd} ctaDesc={content.destinyCardCtaDesc} ctaBtn={content.destinyCardCtaBtn} />}

            <PageHeader title={content.destinyCardPageTitle} />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 shadow-lg rounded-2xl">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="size-8 text-purple-600 shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-purple-900">{content.destinyCardStarterTitle}</h3>
                                <p className="text-sm text-purple-700">{content.destinyCardStarterDesc}</p>
                            </div>
                        </div>
                        {isStarterLoading && <div className="flex justify-center p-4"><Loader className="animate-spin text-purple-500"/></div>}
                        {conversationStarter && !isStarterLoading && (
                            <div className="relative p-4 bg-white/80 rounded-lg shadow-inner">
                                <p className="font-semibold text-gray-800 pr-10">{conversationStarter}</p>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => handleCopy(conversationStarter)}><Copy className="size-4 text-gray-500" /></Button>
                            </div>
                        )}
                        <Button onClick={handleNewConversation} disabled={isStarterLoading} className="w-full mt-4 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"><Sparkles className="mr-2"/>{content.destinyCardStarterBtn}</Button>
                    </CardContent>
                </Card>

                <div className="space-y-4 pb-10">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex items-start gap-3", { "justify-end": message.role === "user" })}>
                            {message.role === 'ai' && <Avatar className="size-8 border shadow-sm"><AvatarFallback className="bg-gray-800 text-white"><Bot className="size-5" /></AvatarFallback></Avatar>}
                            <div className={cn("max-w-[85%]", message.role === 'user' ? "rounded-2xl p-4 bg-blue-600 text-white shadow-md" : "flex-1")}>
                                {typeof message.content === 'string' ? <p className="text-sm leading-relaxed">{message.content}</p> : (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Suggestions:</p>
                                        <ReplySuggestion title="Funny" text={message.content.funny} onCopy={handleCopy} />
                                        <ReplySuggestion title="Caring" text={message.content.caring} onCopy={handleCopy} />
                                        <ReplySuggestion title="Flirty" text={message.content.flirty} onCopy={handleCopy} />
                                    </div>
                                )}
                            </div>
                            {message.role === 'user' && <Avatar className="size-8 border shadow-sm"><AvatarFallback className="bg-blue-100 text-blue-600"><User className="size-5"/></AvatarFallback></Avatar>}
                        </div>
                    ))}
                    {isLoading && <div className="flex items-start gap-3"><Avatar className="size-8 border"><AvatarFallback className="bg-gray-800 text-white"><Bot className="size-5" /></AvatarFallback></Avatar><div className="p-3 bg-white border rounded-2xl flex items-center gap-2 shadow-sm"><Loader className="size-4 animate-spin text-gray-400" /><span className="text-sm text-gray-500">AI is thinking...</span></div></div>}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <div className="border-t p-4 bg-white/95 backdrop-blur-md sticky bottom-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2 max-w-4xl mx-auto">
                        <div className="flex-1">
                            <FormControl>
                                <Textarea
                                    placeholder={messageCredit > 0 ? content.destinyCardInputPlaceholder : "Watch ad for more..."}
                                    disabled={isLoading || messageCredit <= 0}
                                    className="min-h-[50px] max-h-32 rounded-2xl px-4 py-3 resize-none border-gray-200 focus:ring-blue-500"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.handleSubmit(onSubmit)(); } }}
                                    {...form.register("lastMessage")}
                                />
                            </FormControl>
                        </div>
                        <Button type="submit" disabled={isLoading || !form.watch("lastMessage")?.trim() || messageCredit <= 0} size="icon" className="rounded-xl h-12 w-12 bg-blue-600 hover:bg-blue-700 shadow-lg shrink-0">
                            {isLoading ? <Loader className="animate-spin" /> : <Send className="size-5" />}
                        </Button>
                    </form>
                </Form>
                {messageCredit > 0 && <div className="text-[10px] text-center text-gray-400 mt-2 font-medium tracking-wide"><Award className="inline size-3 text-green-500 mr-1 mb-0.5" /> {messageCredit} MESSAGES LEFT</div>}
            </div>
        </div>
    );
}