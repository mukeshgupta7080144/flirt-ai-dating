"use client";

import { useMemo } from 'react';
import PageHeader from "@/components/page-header";
import { funnyFlirts, funnyFlirtsEn } from "@/lib/flirting-lines";
import { LineCard } from "@/app/affirmations/components/line-card";
import { useLanguage } from '@/hooks/useLanguage';

export default function FunnyFlirtsPage() {
    const { language } = useLanguage();

    const lines = useMemo(() => {
        return language === 'en' ? funnyFlirtsEn : funnyFlirts;
    }, [language]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title="Funny Flirts" />
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
