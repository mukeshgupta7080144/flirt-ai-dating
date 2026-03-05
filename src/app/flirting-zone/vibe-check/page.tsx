"use client";

import { useMemo, useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { vibeCheckLines, vibeCheckLinesEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';

export default function VibeCheckPage() {
    const { language } = useLanguage();

    // 🧠 नया स्टेट जो ताज़ा AI लाइन्स को स्टोर करेगा
    const [aiLines, setAiLines] = useState<any[] | null>(null);

    useEffect(() => {
        // पेज लोड होते ही फोन की मेमोरी (localStorage) चेक करो
        const storedData = localStorage.getItem("flirt_ai_all_lines");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                // 🎯 'Vibe Check' की नई लाइन्स ढूँढो और सेट कर दो
                if (parsedData && parsedData.vibeCheck) {
                    setAiLines(parsedData.vibeCheck);
                }
            } catch (error) {
                console.error("Local storage error:", error);
            }
        }
    }, []);

    const lines = useMemo(() => {
        // अगर इंग्लिश है तो इंग्लिश वाली दिखाओ
        if (language === 'en') return vibeCheckLinesEn;
        
        // 🔥 अगर AI की नई लाइन्स मौजूद हैं, तो वो दिखाओ, वरना पुरानी वाली (vibeCheckLines) दिखाओ!
        return aiLines && aiLines.length > 0 ? aiLines : vibeCheckLines;
    }, [language, aiLines]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="Vibe Check" />
            {/* pb-32 जोड़ा है ताकि नीचे के बटन्स छिप न जाएँ */}
            <div className="flex-1 space-y-4 p-4 md:p-6 pb-32">
                <div className="grid gap-4">
                    {lines.map((line, index) => (
                        <LineCard key={index} line={line.line} usageTip={line.usageTip} />
                    ))}
                </div>
            </div>
        </div>
    );
}