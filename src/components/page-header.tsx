
'use client';

import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { useLanguage } from "@/hooks/useLanguage";
import { useMemo } from "react";
import { uiTranslations } from "@/lib/translations";

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const buttonText = content.toggleBtn;

    return (
        <Button onClick={toggleLanguage} variant="ghost" size="sm" className="font-semibold text-xs h-8 rounded-full px-3">
            {buttonText}
        </Button>
    )
}

export default function PageHeader({ title }: { title: string }) {
    return (
        <header className="flex h-16 shrink-0 items-center border-b px-4">
            <div className="flex-1 flex justify-start">
                <SidebarTrigger />
            </div>
            <h1 className="text-lg font-bold text-center">{title}</h1>
            <div className="flex-1 flex justify-end">
                <LanguageToggle />
            </div>
        </header>
    )
}
