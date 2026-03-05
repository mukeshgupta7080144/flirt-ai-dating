"use client";

import { useMemo, useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import {
    funnyFlirts,
    deepLines,
    iceBreakerQuestions,
    boldQuestions,
    funnyFlirtsEn,
    deepLinesEn,
    iceBreakerQuestionsEn,
    boldQuestionsEn,
} from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

// ✅ FIX: TypeScript की लाल लाइन को हटाने के लिए एक स्ट्रक्चर (Type) बना दिया
interface FlirtLine {
    line: string;
    usageTip?: string;
    proTip?: string;
}

export default function LoveQuestPage() {
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    // 🧠 नया स्टेट जो ताज़ा AI लाइन्स को स्टोर करेगा
    const [aiLines, setAiLines] = useState<FlirtLine[] | null>(null);

    useEffect(() => {
        // पेज लोड होते ही फोन की मेमोरी (localStorage) चेक करो
        const storedData = localStorage.getItem("flirt_ai_all_lines");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                // 🎯 'Questions' की नई लाइन्स ढूँढो और सेट कर दो
                if (parsedData && parsedData.questions) {
                    setAiLines(parsedData.questions);
                }
            } catch (error) {
                console.error("Local storage error:", error);
            }
        }
    }, []);

    const allQuestions = useMemo(() => {
        // अगर इंग्लिश है तो इंग्लिश वाली दिखाओ
        if (language === 'en') {
            return [
                ...funnyFlirtsEn,
                ...deepLinesEn,
                ...boldQuestionsEn,
                ...iceBreakerQuestionsEn,
            ] as FlirtLine[];
        }
        
        // 🔥 अगर AI की नई लाइन्स मौजूद हैं, तो वो दिखाओ, वरना पुरानी वाली (Default) दिखाओ!
        if (aiLines && aiLines.length > 0) {
            return aiLines;
        }

        return [
            ...funnyFlirts,
            ...deepLines,
            ...boldQuestions,
            ...iceBreakerQuestions,
        ] as FlirtLine[];
    }, [language, aiLines]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title={content.loveQuestTitle} />
            {/* pb-32 जोड़ा है ताकि नीचे के बटन्स छिप न जाएँ */}
            <div className="flex-1 space-y-4 p-4 md:p-6 pb-32">
                <div className="grid gap-4">
                    {allQuestions.map((q, index) => (
                        // ✅ FIX: लाल लाइन हट गई! अब यह एकदम क्लीन है।
                        <LineCard key={index} line={q.line} usageTip={q.usageTip || q.proTip} />
                    ))}
                </div>
            </div>
        </div>
    );
}