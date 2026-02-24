"use client";

import { useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { anokhiNight, anokhiNightEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';

export default function AnokhiNightPage() {
    const { language } = useLanguage();

    const lines = useMemo(() => {
        return language === 'en' ? anokhiNightEn : anokhiNight;
    }, [language]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="Anokhi Night" />
            <div className="flex-1 space-y-4 p-4 md:p-6">
                <div className="grid gap-4">
                    {lines.map((line, index) => (
                        <LineCard key={index} line={line.line} usageTip={line.usageTip} />
                    ))}
                </div>
            </div>
        </div>
    );
}
