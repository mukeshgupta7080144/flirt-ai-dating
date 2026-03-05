"use client";

import { useMemo, useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { damageControl, damageControlEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

export default function DamageControlPage() {
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    // 🧠 नया स्टेट जो ताज़ा AI लाइन्स को स्टोर करेगा
    const [aiLines, setAiLines] = useState<any[] | null>(null);

    useEffect(() => {
        // पेज लोड होते ही फोन की मेमोरी (localStorage) चेक करो
        const storedData = localStorage.getItem("flirt_ai_all_lines");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                // 🎯 'Damage Control' की नई लाइन्स ढूँढो और सेट कर दो
                if (parsedData && parsedData.damageControl) {
                    setAiLines(parsedData.damageControl);
                }
            } catch (error) {
                console.error("Local storage error:", error);
            }
        }
    }, []);

    const lines = useMemo(() => {
        // अगर इंग्लिश है तो इंग्लिश वाली दिखाओ
        if (language === 'en') return damageControlEn;
        
        // 🔥 अगर AI की नई लाइन्स मौजूद हैं, तो वो दिखाओ, वरना पुरानी वाली (damageControl) दिखाओ!
        return aiLines ? aiLines : damageControl;
    }, [language, aiLines]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title={content.damageControlTitle} />
            {/* pb-32 जोड़ा है ताकि नीचे के बटन्स छिप न जाएँ */}
            <div className="flex-1 space-y-4 p-4 md:p-6 pb-32">
                <div className="grid gap-4">
                    {lines.map((line, index) => (
                        <LineCard key={index} line={line.line} usageTip={line.usageTip} />
                    ))}
                </div>
                 <div className="p-8 text-center text-muted-foreground">
                    <h3 className="font-bold text-lg mb-2 text-foreground">{content.damageControlTipTitle}</h3>
                    <div className="space-y-4 text-sm text-left max-w-md mx-auto">
                        <p><strong>{content.damageControlTip1.split(':')[0]}:</strong> {content.damageControlTip1.split(':')[1]}</p>
                        <p><strong>{content.damageControlTip2.split(':')[0]}:</strong> {content.damageControlTip2.split(':')[1]}</p>
                        <p><strong>{content.damageControlTip3.split(':')[0]}:</strong> {content.damageControlTip3.split(':')[1]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}