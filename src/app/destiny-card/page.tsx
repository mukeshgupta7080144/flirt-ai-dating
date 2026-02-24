
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import PageHeader from "@/components/page-header";
import { getReplyAction } from './actions';
import type { GenerateReplyOutput } from "@/ai/flows/reply-generator";
import { Bot, Copy, Loader, Sparkles, Send, User, Lightbulb, CornerDownLeft, Award, Video, Gift } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAds } from '@/providers/AdProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';
import { getNewLineAction } from '../flirting-zone/actions';

const replyFormSchema = z.object({
  lastMessage: z.string().min(1, { message: "Please enter the message you received." }),
});

type Message = {
  id: number;
  role: "user" | "ai";
  content: string | GenerateReplyOutput;
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
            <p className="text-xs mt-4 opacity-70">This helps keep our AI tools available for everyone.</p>
        </div>
    </div>
);

function ReplySuggestion({ title, text, onCopy }: { title: string, text: string, onCopy: (text: string) => void }) {
    const Icon = title === 'Funny' ? '🤣' : title === 'Caring' ? '🥰' : '😏';
    return (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-sm">
            <CardContent className="p-3">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-sm text-gray-800">{Icon} {title}</p>
                        <p className="text-gray-700 mt-1 text-sm">{text}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-1 -mr-1" onClick={() => onCopy(text)}>
                        <Copy className="size-4 text-gray-500" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ChatGuidePage() {
    const { toast } = useToast();
    const { showRewardedAd, isRewardedLoaded, isRewardedLoading } = useAds();
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

    const [messageCredit, setMessageCredit] = useState(0);
    const [showAdScreen, setShowAdScreen] = useState(false);

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

    useEffect(scrollToBottom, [messages, isLoading]);
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ title: content.toastCopiedTitle, description: content.toastCopiedDescription });
    };
    
    const handleNewConversation = async () => {
        setIsStarterLoading(true);
        setConversationStarter(null);
        // This action only supports Hinglish for now
        const { line, error } = await getNewLineAction();
        if (line) {
            setConversationStarter(line);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: error });
        }
        setIsStarterLoading(false);
    };

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

    const onSubmit = async (data: z.infer<typeof replyFormSchema>) => {
        const { lastMessage } = data;
        if (!lastMessage.trim() || isLoading) return;

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
            role: 'user',
            content: lastMessage,
        };

        setMessages((prev) => [...prev, userMessage]);
        setMessageCredit((prev) => prev - 1);
        setIsLoading(true);
        form.reset();

        const { result, error } = await getReplyAction(lastMessage, language);

        setIsLoading(false);

        if (result) {
            const aiMessage: Message = {
                id: Date.now() + 1,
                role: "ai",
                content: result,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } else if (error) {
            toast({ variant: 'destructive', title: 'AI Error', description: error });
            // remove the user message if AI fails, and refund credit
            setMessages((prev) => prev.filter(m => m.id !== userMessage.id));
            setMessageCredit((prev) => prev + 1);
        }
    };
    
    const isChatStarted = messages.length > 0;

    return (
        <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-gray-50 to-blue-50 relative">
            {showAdScreen && <AdScreen onWatchAd={handleWatchAd} isAdLoading={isRewardedLoading} isAdLoaded={isRewardedLoaded} messagesLeft={messageCredit} ctaTitle={content.destinyCardCtaWatchAd} ctaDesc={content.destinyCardCtaDesc} ctaBtn={content.destinyCardCtaBtn} />}

            <PageHeader title={content.destinyCardPageTitle} />
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                {/* Conversation Starter */}
                <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 shadow-lg rounded-2xl">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="size-8 text-purple-600 shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-purple-900">{content.destinyCardStarterTitle}</h3>
                                <p className="text-sm text-purple-700">{content.destinyCardStarterDesc}</p>
                            </div>
                        </div>

                        {isStarterLoading && (
                             <div className="flex items-center justify-center p-4 bg-white/50 rounded-lg min-h-[60px]">
                                <Loader className="animate-spin text-purple-500"/>
                             </div>
                        )}

                        {conversationStarter && !isStarterLoading && (
                            <div className="relative p-4 bg-white/80 rounded-lg">
                                <p className="font-semibold text-gray-800 pr-10">{conversationStarter}</p>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => handleCopy(conversationStarter)}>
                                    <Copy className="size-4 text-gray-500" />
                                </Button>
                            </div>
                        )}
                        
                        <Button onClick={handleNewConversation} disabled={isStarterLoading} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-purple-400 disabled:cursor-not-allowed">
                            <Sparkles className="mr-2"/>
                            {content.destinyCardStarterBtn}
                        </Button>
                    </CardContent>
                </Card>

                {/* Reply Generator */}
                 {!isChatStarted && !showAdScreen && (
                    <div className="text-center pt-8">
                        <div className="inline-flex items-center gap-2">
                            <CornerDownLeft className="size-5 text-gray-500" />
                            <h2 className="text-xl font-bold text-gray-800">{content.destinyCardReplyTitle}</h2>
                            <div className="w-5" />
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">{content.destinyCardReplyDesc}</p>
                    </div>
                 )}

                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex items-start gap-3", { "justify-end": message.role === "user" })}>
                            {message.role === 'ai' && (
                                <Avatar className="size-8 border">
                                    <AvatarFallback className="bg-gray-700 text-white"><Bot className="size-5" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn("max-w-md", message.role === 'user' ? "rounded-2xl p-3 bg-primary text-primary-foreground" : "")}>
                                {typeof message.content === 'string' ? (
                                    <p>{message.content}</p>
                                ) : (
                                    <div className="flex-1 space-y-3">
                                        <p className="text-sm font-semibold text-muted-foreground">Here are a few ideas for you:</p>
                                        <ReplySuggestion title="Funny" text={message.content.funny} onCopy={handleCopy} />
                                        <ReplySuggestion title="Caring" text={message.content.caring} onCopy={handleCopy} />
                                        <ReplySuggestion title="Flirty" text={message.content.flirty} onCopy={handleCopy} />
                                    </div>
                                )}
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="size-8 border">
                                    <AvatarFallback><User className="size-5"/></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <Avatar className="size-8 border">
                                <AvatarFallback className="bg-gray-700 text-white"><Bot className="size-5" /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-md rounded-2xl p-3 bg-card border flex items-center gap-2">
                                <Loader className="size-5 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-2 md:p-4 bg-background/95 backdrop-blur-sm sticky bottom-0">
                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex items-start gap-2"
                    >
                        <FormField
                            control={form.control}
                            name="lastMessage"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Textarea
                                            placeholder={messageCredit > 0 ? `${content.destinyCardInputPlaceholder} (${messageCredit} messages left)` : "Watch ad to chat"}
                                            disabled={isLoading || (messageCredit <= 0 && !showAdScreen)}
                                            className="flex-1 min-h-[44px] max-h-24 resize-none rounded-full px-4 py-3"
                                            rows={1}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.handleSubmit(onSubmit)(); } }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = "auto";
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="pl-4" />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={isLoading || !form.watch("lastMessage")?.trim() || (messageCredit <= 0 && !showAdScreen)} size="icon" className="rounded-full h-12 w-12 shrink-0">
                            {isLoading ? <Loader className="animate-spin" /> : <Send />}
                         </Button>
                    </form>
                </Form>
                 {messageCredit > 0 && !showAdScreen && (
                    <div className="text-xs text-center text-muted-foreground pt-2 flex items-center justify-center gap-1">
                        <Award className="size-3 text-green-500" /> You have {messageCredit} free messages remaining.
                    </div>
                )}
            </div>
        </div>
    );
}
