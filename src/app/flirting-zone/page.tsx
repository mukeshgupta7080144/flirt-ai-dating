"use client";

import { useState, useEffect, useMemo } from "react";
import { Copy, Heart, Laugh, Angry, Smile, Ghost, Moon, HeartHandshake, RefreshCw, Loader, Sparkles } from "lucide-react";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SareeIcon } from "@/components/custom-icons";
import Link from "next/link";
import { useAds } from "@/providers/AdProvider";
import { useLanguage } from "@/hooks/useLanguage";
import { uiTranslations } from "@/lib/translations";
import { flirtyLinesEn, cuteLinesEn, deepLinesEn } from "@/lib/flirting-lines";
// 🔐 मास्टर API क्लाइंट को यहाँ इम्पोर्ट किया
import { callAI } from "@/lib/api-client";

const features = [
    { title: "Question", icon: SareeIcon, color: "bg-secondary", href: "/flirting-zone/desi-bawal" },
    { title: "Funny Flirts", icon: Ghost, color: "bg-pink-100", href: "/flirting-zone/funny-flirts" },
    { title: "Anokhi Night", icon: Moon, color: "bg-blue-100", href: "/flirting-zone/anokhi-night" },
    { title: "Damage Control", icon: HeartHandshake, color: "bg-orange-100", href: "/flirting-zone/damage-control" },
    { title: "Vibe Check", icon: Sparkles, color: "bg-purple-100", href: "/flirting-zone/vibe-check" },
];

export default function FlirtingZonePage() {
    const { toast } = useToast();
    const { showBanner, hideBanner, showRewardedAd, isRewardedLoaded, showInterstitialAd } = useAds();
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const [generatedLine, setGeneratedLine] = useState<string | null>(content.newLinePrompt);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAdButtonClick, setIsAdButtonClick] = useState(false);

    useEffect(() => {
        setGeneratedLine(content.newLinePrompt);
    }, [content.newLinePrompt]);

    useEffect(() => {
        showBanner();
        return () => hideBanner();
    }, [showBanner, hideBanner]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: content.toastCopiedTitle,
            description: "Line copied to clipboard!"
        });
        
        if (showInterstitialAd) {
            showInterstitialAd();
        }
    };

    const handleGenerateLine = async () => {
        setIsAdButtonClick(true);

        if (!isRewardedLoaded) {
            toast({
                variant: "destructive",
                title: "Ad Not Ready",
                description: "Please wait a moment for the ad to load."
            });
            setIsAdButtonClick(false);
            return;
        }

        const getNewLine = async () => {
            setIsGenerating(true);
            setIsAdButtonClick(false);

            if (language === 'hi') {
                try {
                    // ✅ पुराने fetch को हटाकर मास्टर callAI लगाया (Key अपने आप चली जाएगी)
                    const data = await callAI("newLine");

                    if (data.result && data.result.line) {
                        setGeneratedLine(data.result.line);
                    } else {
                        toast({ variant: "destructive", title: "Error", description: "Failed to fetch line." });
                        setGeneratedLine("Couldn't generate a line. Please try again.");
                    }
                } catch (error: any) {
                    console.error("API Call Failed:", error);
                    toast({ variant: "destructive", title: "Network Error", description: error.message || "Please check internet." });
                    setGeneratedLine("Couldn't generate a line. Please try again.");
                }
            } else {
                const allEnglishLines = [...flirtyLinesEn, ...cuteLinesEn, ...deepLinesEn];
                const randomLine = allEnglishLines[Math.floor(Math.random() * allEnglishLines.length)];
                setGeneratedLine(randomLine.line);
            }
            setIsGenerating(false);
        }

        if (showRewardedAd) {
            showRewardedAd(getNewLine);
        } else {
            await getNewLine();
        }

        setTimeout(() => setIsAdButtonClick(false), 3000);
    };

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title={content.flirtZonePageTitle} />
            <div className="flex-1 space-y-8 p-4 md:p-6 pb-32">
                <Card className="rounded-2xl bg-secondary shadow-md">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div>
                            <p className="font-semibold">{content.aiGeneratedLine}</p>
                            <p className="text-muted-foreground min-h-[40px] pt-1">{generatedLine}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button
                                onClick={handleGenerateLine}
                                disabled={isGenerating || isAdButtonClick}
                                size="sm"
                                className="bg-primary text-white font-bold shadow-lg hover:scale-105 transition-transform"
                            >
                                {isGenerating || isAdButtonClick ? (
                                    <Loader className="mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2" />
                                )}
                                {isGenerating || isAdButtonClick ? "Loading..." : content.newLineBtn}
                            </Button>
                            {generatedLine && !isGenerating && !generatedLine.includes(content.newLinePrompt) && !generatedLine.startsWith("Couldn't") && (
                                <Button variant="ghost" size="sm" onClick={() => handleCopy(generatedLine)}>
                                    <Copy className="mr-2" />
                                    {content.copyLineBtn}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-border shadow-md">
                            <Laugh className={`size-8 text-yellow-500`} />
                        </Button>
                        <p className="text-xs font-medium text-muted-foreground">{content.moodHappy}</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-border shadow-md">
                            <Angry className={`size-8 text-red-500`} />
                        </Button>
                        <p className="text-xs font-medium text-muted-foreground">{content.moodAngry}</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-border shadow-md">
                            <Smile className={`size-8 text-blue-500`} />
                        </Button>
                        <p className="text-xs font-medium text-muted-foreground">{content.moodShy}</p>
                    </div>
                     <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-border shadow-md">
                            <Heart className={`size-8 text-pink-500`} />
                        </Button>
                        <p className="text-xs font-medium text-muted-foreground">{content.moodRomantic}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Link href={feature.href} key={feature.title} className="block transition-all hover:scale-105">
                                <Card className={`h-32 rounded-2xl shadow-md ${feature.color}`}>
                                    <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                                        <Icon className="size-8 text-foreground/80" />
                                        <p className="font-semibold text-foreground/90">{feature.title}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}