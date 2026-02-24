"use client";

import { useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { damageControl, damageControlEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

export default function DamageControlPage() {
    const { language } = useLanguage();
    
    const content = useMemo(() => uiTranslations[language], [language]);

    const lines = useMemo(() => {
        return language === 'en' ? damageControlEn : damageControl;
    }, [language]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title={content.damageControlTitle} />
            <div className="flex-1 space-y-4 p-4 md:p-6">
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
