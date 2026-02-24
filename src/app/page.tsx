
'use client';

import Link from 'next/link';
import {
  HeartPulse,
  BookText,
  Heart,
  SunMoon,
  BrainCircuit,
  Flame,
  MessageSquare,
  Text,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BottomNav } from '@/components/bottom-nav';
import { Button } from '@/components/ui/button';
import { HeartWithBandageIcon } from '@/components/custom-icons';
import { useAds } from '@/providers/AdProvider';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);
    const buttonText = content.toggleBtn;
    
    return (
        <Button onClick={toggleLanguage} variant="ghost" size="sm" className="font-semibold text-white hover:text-white hover:bg-white/10 h-8 rounded-full px-3">
            {buttonText}
        </Button>
    )
}

export default function Home() {
    const [currentDate, setCurrentDate] = useState('');
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const { showInterstitialAd, preloadInterstitial } = useAds();
    const { language } = useLanguage();
    const content = useMemo(() => uiTranslations[language], [language]);

    const featureCards = useMemo(() => [
        {
            title: content.chatGuideTitle,
            icon: BookText,
            href: '/destiny-card',
            color: 'bg-gradient-to-br from-teal-100 to-cyan-200',
            iconColor: 'text-teal-700',
        },
        {
            title: content.missionTitle,
            icon: HeartPulse,
            href: '/romantic-keyboard',
            color: 'bg-blue-200',
            iconColor: 'text-blue-600',
        },
        {
            title: content.commentCardTitle,
            icon: MessageSquare,
            href: '/community',
            color: 'bg-green-200',
            iconColor: 'text-green-600',
        },
        {
            title: content.romanticLinesTitle,
            icon: Heart,
            href: '/affirmations',
            color: 'bg-rose-200',
            iconColor: 'text-rose-600',
        },
        {
            title: content.flirtingZoneTitle,
            icon: Flame,
            href: '/flirting-zone',
            color: 'bg-orange-200',
            iconColor: 'text-orange-600',
        },
        {
            title: content.asciiArtTitle,
            icon: Text,
            href: '/ascii-art',
            color: 'bg-indigo-200',
            iconColor: 'text-indigo-600',
        },
    ], [content]);
    
    useEffect(() => {
        setIsClient(true);
        setCurrentDate(format(new Date(), 'EEEE, MMMM d, yyyy'));
    }, []);

    const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href === '/affirmations' || href === '/flirting-zone') {
            e.preventDefault();
            showInterstitialAd(() => router.push(href));
        }
        if (href === '/community') {
            preloadInterstitial();
        }
    };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F8F9FB]">
        <header className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-4 text-white shadow-lg space-y-4 rounded-3xl m-2">
            <div className="flex items-center justify-between">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <h1 className="font-cursive text-3xl tracking-tight">{content.headerTitle}</h1>
                <LanguageToggle />
            </div>
            
            <p className="text-center text-xs text-white/80 h-4">{isClient ? currentDate : ''}</p>

        </header>

        <main className="flex-1 space-y-6 overflow-y-auto p-4 pt-0 pb-32">
          {/* Hero Card */}
          <Link href="/relationship-insights">
            <Card className="overflow-hidden rounded-[25px] border-none bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                    <HeartWithBandageIcon className="size-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{content.clinicTitle}</h2>
                    <p className="text-sm opacity-90">{content.clinicSub}</p>
                  </div>
                </div>
                <div className="w-full mt-4 h-12 rounded-full bg-yellow-400 text-black font-bold text-base shadow-lg shadow-black/20 flex items-center justify-center">
                  {content.clinicBtn}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link href={card.href} key={card.href} onClick={(e) => handleCardClick(e, card.href)}>
                  <Card className={cn("group flex h-28 flex-col items-center justify-center gap-2 rounded-[20px] border-none text-center transition-all hover:-translate-y-1 hover:shadow-lg", card.color)} style={{boxShadow: "0 8px 15px rgba(0, 0, 0, 0.05)"}}>
                    <Icon className={cn("size-7", card.iconColor)} />
                    <p className="font-semibold text-gray-800 text-sm">{card.title}</p>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Love Guide */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{content.loveGuideTitle}</h2>
            <div className="grid grid-cols-1 gap-4">
                {/* Soul Connect Card */}
                <Link href="/soul-connect" className="block">
                    <Card className="rounded-2xl h-full border-none bg-gradient-to-br from-blue-100 to-indigo-200 p-4 flex flex-col justify-between shadow-sm transition-all hover:-translate-y-1">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit className="size-6 text-indigo-700" />
                                <h3 className="font-bold text-lg text-indigo-800">{content.soulConnectTitle}</h3>
                            </div>
                            <p className="text-xs text-indigo-700 mb-4">{content.soulConnectDesc}</p>
                             <div className="space-y-1 text-sm text-indigo-700 font-medium">
                                <p>• Relationship Tips</p>
                                <p>• Conversation Starters</p>
                                <p>• Understanding Moods</p>
                            </div>
                        </div>
                        <div className="w-full mt-4 text-center bg-indigo-500 text-white font-semibold py-2 rounded-md">
                            {content.soulConnectExplore}
                        </div>
                    </Card>
                </Link>
            </div>
          </div>
          
        </main>
      <BottomNav />
    </div>
  );
}
