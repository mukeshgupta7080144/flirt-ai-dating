"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { getCommentAction } from './actions';
import type { SmartCommentOutput } from '@/ai/flows/comment-generator';
import { Wand2, Loader, Copy } from 'lucide-react';
import { useAds } from '@/providers/AdProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

const commentFormSchema = z.object({
  photoDescription: z.string().min(10, { message: "Please describe the photo in at least 10 characters." }),
});

type CommentState = {
    result?: SmartCommentOutput;
    error?: string | object;
};

function SubmitButton({ isPending, buttonText, loadingText }: { isPending: boolean; buttonText: string, loadingText: string }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full bg-primary h-12 text-base font-bold">
      {isPending ? (
        <>
          <Loader className="mr-2 size-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Wand2 className="mr-2 size-5" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

const ResultCard = ({ titleKey, localizedTitle, text, onCopy }: { titleKey: string; localizedTitle: string; text: string; onCopy: (text: string) => void }) => {
    const emojiMap: { [key: string]: string } = {
        funny: '🤣',
        respectful: '😇',
        short: '✨',
    };

    return (
        <div className="relative rounded-2xl bg-white/60 p-4 shadow-md backdrop-blur-sm border border-white/20">
            <div className="flex items-start justify-between">
                <div className="flex-1 pr-8">
                    <h4 className="font-bold text-gray-800">{emojiMap[titleKey]} {localizedTitle}</h4>
                    <p className="mt-1 text-gray-700 text-lg">{text}</p>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-9 w-9" onClick={() => onCopy(text)}>
                    <Copy className="size-5 text-gray-500" />
                </Button>
            </div>
        </div>
    );
};

export default function CommentGeneratorPage() {
    const { toast } = useToast();
    const { showBanner, hideBanner, showInterstitialAd } = useAds();
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const [state, setState] = useState<CommentState>({});
    const [isPending, setIsPending] = useState(false);
    
    const form = useForm<z.infer<typeof commentFormSchema>>({
        resolver: zodResolver(commentFormSchema),
        defaultValues: { photoDescription: "" },
    });

    useEffect(() => {
        showBanner();
        return () => {
            hideBanner();
        }
    }, [showBanner, hideBanner]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: content.toastCopiedTitle, description: content.toastCopiedDescription });
    };

    const onSubmit = async (data: z.infer<typeof commentFormSchema>) => {
        setIsPending(true);
        setState({}); // Reset state

        const { result, error } = await getCommentAction({
            photoDescription: data.photoDescription,
            language: language,
        });

        if (error) {
            if (typeof error === 'string') {
                toast({
                    variant: 'destructive',
                    title: content.toastErrorTitle,
                    description: error,
                });
            } else {
                 const fieldErrors = error as any;
                 if (fieldErrors.photoDescription) {
                    form.setError("photoDescription", { message: fieldErrors.photoDescription[0] });
                 }
            }
            setState({ error });
        }
        
        if (result) {
            setState({ result });
            form.reset();
            showInterstitialAd();
        }
        
        setIsPending(false);
    }

    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-pink-50">
            <PageHeader title={content.commentPageTitle} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
                <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-2xl bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold font-playfair text-gray-800">
                            {content.commentTitleL1}<br/>{content.commentTitleL2}
                        </CardTitle>
                        <CardDescription className="text-center">{content.commentDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form 
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="photoDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">{content.commentFormLabel}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={content.commentPlaceholder}
                                                    className="min-h-[120px] rounded-xl text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <SubmitButton isPending={isPending} buttonText={content.commentBtn} loadingText={content.commentLoading} />
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {state.result && (
                    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
                         <h3 className="text-xl font-bold text-center text-gray-800">{content.commentResultsTitle}</h3>
                         <ResultCard titleKey="funny" localizedTitle={content.commentFunny} text={state.result.funny} onCopy={handleCopy} />
                         <ResultCard titleKey="respectful" localizedTitle={content.commentRespectful} text={state.result.respectful} onCopy={handleCopy} />
                         <ResultCard titleKey="short" localizedTitle={content.commentShort} text={state.result.short} onCopy={handleCopy} />
                    </div>
                )}
            </main>
        </div>
    );
}
