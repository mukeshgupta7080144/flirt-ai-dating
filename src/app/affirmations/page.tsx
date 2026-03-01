"use client";

import { useState, useMemo, useEffect } from 'react';
import { Search, Loader, RefreshCw, Copy, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineCard } from './components/line-card';
import { 
    cuteLines, deepLines, flirtyLines, shayariLines,
    cuteLinesEn, deepLinesEn, flirtyLinesEn, shayariLinesEn 
} from '@/lib/flirting-lines';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import { useAds } from '@/providers/AdProvider';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';
// 🔐 मास्टर API क्लाइंट को यहाँ इम्पोर्ट किया
import { callAI } from '@/lib/api-client';

export default function RomanticLinesPage() {
    const { toast } = useToast();
    const { showBanner, hideBanner, showRewardedAd, isRewardedLoaded } = useAds();
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const [selectedCategory, setSelectedCategory] = useState("Cute");
    const [searchTerm, setSearchTerm] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAdButtonClick, setIsAdButtonClick] = useState(false);
    const [isInitialState, setIsInitialState] = useState(true);

    const initialCategories = useMemo(() => {
        if (language === 'en') {
            return [
                { name: "Cute", lines: cuteLinesEn },
                { name: "Deep", lines: deepLinesEn },
                { name: "Flirty", lines: flirtyLinesEn },
                { name: "Poetic", lines: shayariLinesEn }
            ];
        }
        return [
            { name: "Cute", lines: cuteLines },
            { name: "Deep", lines: deepLines },
            { name: "Flirty", lines: flirtyLines },
            { name: "Shayari", lines: shayariLines }
        ];
    }, [language]);

    const [allCategoriesData, setAllCategoriesData] = useState(initialCategories);
    const [generatedLine, setGeneratedLine] = useState<string | null>(content.affirmationsCtaLine);

    useEffect(() => {
        setAllCategoriesData(initialCategories);
        setGeneratedLine(content.affirmationsCtaLine);
        setSelectedCategory(initialCategories[0].name);
        setIsInitialState(true);
    }, [initialCategories, content.affirmationsCtaLine]);

    useEffect(() => {
        showBanner();
        return () => hideBanner();
    }, [showBanner, hideBanner]);

    const allLines = useMemo(() => 
        allCategoriesData.flatMap(c => c.lines), 
        [allCategoriesData]
    );

    const filteredLines = useMemo(() => {
        if (searchTerm) {
            return allLines.filter(item => 
                item.line.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (item.usageTip && item.usageTip.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return allCategoriesData.find(c => c.name === selectedCategory)?.lines || [];
    }, [selectedCategory, searchTerm, allCategoriesData, allLines]);

    const handleRefreshAllLines = async () => {
        if (language === 'en') {
            toast({
                title: "Feature coming soon!",
                description: "AI generation for English lines is currently in development.",
            });
            return;
        }

        if (!isRewardedLoaded) {
            toast({
                variant: "destructive",
                title: "Ad Not Ready",
                description: "Ad loading... please try again in a moment."
            });
            return;
        }

        setIsAdButtonClick(true);

        const getNewLines = async () => {
            setIsGenerating(true);
            setIsAdButtonClick(false);

            try {
                // ✅ पुराने fetch को हटाकर मास्टर callAI लगाया (Key अपने आप चली जाएगी)
                const data = await callAI("allNewLines");

                if (data.result) {
                    const { cute, deep, flirty, shayari } = data.result;

                    const newCategoriesData = [
                        { name: "Cute", lines: cute || [] },
                        { name: "Deep", lines: deep || [] },
                        { name: "Flirty", lines: flirty || [] },
                        { name: "Shayari", lines: shayari || [] }
                    ];

                    setAllCategoriesData(newCategoriesData);

                    if (cute?.length > 0) {
                        setGeneratedLine(cute[0].line);
                        setIsInitialState(false);
                    }

                    toast({
                        title: "New Lines Generated!",
                        description: "AI ne aapke liye nayi lines bana di hain."
                    });

                } else if (data.error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: data.error
                    });
                }

            } catch (error: any) {
                console.error("API Call Failed:", error);
                toast({
                    variant: "destructive",
                    title: "Network Error",
                    description: error.message || "Please check your internet connection."
                });
            } finally {
                setIsGenerating(false);
            }
        };

        if (showRewardedAd) {
            showRewardedAd(getNewLines);
        } else {
            await getNewLines();
        }

        setTimeout(() => setIsAdButtonClick(false), 3000);
    };

    const handleCopy = (line: string) => {
        navigator.clipboard.writeText(line);
        toast({ title: "Copied! Ready to make their day." });
    };

    const handleShare = (line: string) => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(line)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="flex flex-1 flex-col bg-gradient-to-b from-gray-50 to-pink-50">
            <PageHeader title={content.affirmationsPageTitle} />

            <main className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6 pb-28">

                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder={content.affirmationsSearchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-2xl border-gray-200 bg-white focus:ring-2 focus:ring-pink-200 pl-11 h-12 text-base shadow-sm"
                    />
                </div>

                <div className="no-scrollbar -mx-4 flex space-x-2 overflow-x-auto px-4 pb-1">
                    {allCategoriesData.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => {
                                setSelectedCategory(category.name);
                                setSearchTerm("");
                            }}
                            className={cn(
                                "whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition-all",
                                selectedCategory === category.name
                                    ? "border-transparent bg-gray-900 text-white shadow-md scale-105"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-white/80"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {!searchTerm && (
                    <div className="relative p-0.5 rounded-[32px] bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 shadow-xl">
                        <div className="relative rounded-[30px] bg-white/95 p-5 md:p-6 backdrop-blur-md min-h-[180px] flex flex-col justify-between">
                            <p className="font-playfair text-xl md:text-2xl text-gray-800 break-words leading-relaxed mb-6">
                                {generatedLine}
                            </p>

                            <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-4 mt-auto">
                                <Button
                                    onClick={handleRefreshAllLines}
                                    disabled={isGenerating || isAdButtonClick}
                                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all py-6 xs:py-2 px-6 rounded-2xl flex-1"
                                >
                                    {isGenerating || isAdButtonClick ? (
                                        <Loader className="size-5 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="size-5 mr-2" />
                                    )}
                                    {isGenerating || isAdButtonClick ? "Loading..." : "New Line"}
                                </Button>

                                {generatedLine && !isGenerating && !isInitialState && (
                                    <div className="flex items-center justify-center gap-1 rounded-2xl bg-gray-900 p-2 px-4 shadow-lg border border-white/10">
                                        <button onClick={() => handleCopy(generatedLine)} className="flex items-center gap-2 p-1 text-white hover:text-pink-300 transition-colors">
                                            <Copy className="size-5" />
                                            <span className="font-bold text-sm">Copy</span>
                                        </button>
                                        <div className="w-px h-5 bg-white/20 mx-2"></div>
                                        <button onClick={() => handleShare(generatedLine)} className="p-1 text-white hover:text-green-400 transition-colors">
                                            <Send className="size-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {filteredLines.map((line, index) => (
                        <LineCard key={index} line={line.line} usageTip={line.usageTip} />
                    ))}
                </div>
            </main>
        </div>
    );
}