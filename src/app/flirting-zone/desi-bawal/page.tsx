"use client";

import { useMemo } from 'react';
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

export default function LoveQuestPage() {
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const allQuestions = useMemo(() => {
        if (language === 'en') {
            return [
                ...funnyFlirtsEn,
                ...deepLinesEn,
                ...boldQuestionsEn,
                ...iceBreakerQuestionsEn,
            ];
        }
        return [
            ...funnyFlirts,
            ...deepLines,
            ...boldQuestions,
            ...iceBreakerQuestions,
        ];
    }, [language]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader title={content.loveQuestTitle} />
            <div className="flex-1 space-y-4 p-4 md:p-6">
                <div className="grid gap-4">
                    {allQuestions.map((q, index) => (
                        <LineCard key={index} line={q.line} usageTip={(q as any).proTip || q.usageTip} />
                    ))}
                </div>
            </div>
        </div>
    );
}
