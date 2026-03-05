"use client";

import { useMemo, useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { anokhiNight, anokhiNightEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';

export default function AnokhiNightPage() {
    const { language } = useLanguage();
    
    // 🧠 नया स्टेट जो ताज़ा AI लाइन्स को स्टोर करेगा
    const [aiLines, setAiLines] = useState<any[] | null>(null);

    useEffect(() => {
        // पेज लोड होते ही फोन की मेमोरी (localStorage) चेक करो
        const storedData = localStorage.getItem("flirt_ai_all_lines");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                // अगर API ने 'anokhiNight' नाम से नई लाइन्स भेजी हैं, तो उन्हें सेट कर दो
                if (parsedData && parsedData.anokhiNight) {
                    setAiLines(parsedData.anokhiNight);
                }
            } catch (error) {
                console.error("Local storage error:", error);
            }
        }
    }, []);

    const lines = useMemo(() => {
        // अगर इंग्लिश है तो इंग्लिश वाली दिखाओ
        if (language === 'en') return anokhiNightEn;
        
        // 🔥 अगर AI की नई लाइन्स मौजूद हैं, तो वो दिखाओ, वरना पुरानी वाली (anokhiNight) दिखाओ!
        return aiLines ? aiLines : anokhiNight;
    }, [language, aiLines]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="Anokhi Night" />
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