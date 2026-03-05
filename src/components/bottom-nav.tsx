"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ✅ FIX: Search हटाकर BookText (Chat Guide) आइकॉन जोड़ दिया
import { Home, BookText, MessageSquare, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

export function BottomNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { language } = useLanguage();
  const content = useMemo(() => uiTranslations[language], [language]);

  // ✅ FIX: Search को हटाकर 'Chat Guide' का नया बटन एकदम सही लिंक के साथ लगा दिया
  const navItems = useMemo(() => [
    { href: '/', label: content.navHome, icon: Home, key: 'Home' },
    { href: '/destiny-card', label: "Chat Guide", icon: BookText, key: 'ChatGuide' },
    { href: '/community', label: "Comment", icon: MessageSquare, key: 'Comment' },
    { href: '/flirting-zone', label: content.navFlirting, icon: Flame, key: 'Flirting' },
  ], [content]);

  // 🛑 FIX: Search वाला coming soon ब्लॉक हटा दिया है ताकि Chat Guide बटन दबते ही पेज खुल जाए
  const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>, labelKey: string) => {
    // अगर भविष्य में किसी बटन (जैसे Flirting) को 'Coming Soon' बनाना हो, तो यहाँ लिख सकते हैं
    // if (['Flirting'].includes(labelKey)) {
    //     e.preventDefault();
    //     toast({ title: "Coming Soon!", description: `Under construction.` });
    // }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t">
      <nav className="h-16">
        <ul className="flex justify-around items-center h-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.key} className="relative h-full flex-1">
                <Link 
                  href={item.href} 
                  onClick={(e) => handleComingSoon(e, item.key)}
                  className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full"
                >
                  <Icon className={cn(
                    "size-6 transition-colors",
                    isActive ? "text-primary" : "text-gray-500"
                  )} 
                  />
                  <span className={cn("transition-colors", isActive ? "text-primary font-bold" : "text-gray-500")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}