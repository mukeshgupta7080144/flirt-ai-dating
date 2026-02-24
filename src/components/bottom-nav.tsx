
"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bookmark, User, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { uiTranslations } from '@/lib/translations';

export function BottomNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { language } = useLanguage();
  const content = useMemo(() => uiTranslations[language], [language]);

  const navItems = useMemo(() => [
    { href: '/', label: content.navHome, icon: Home, key: 'Home' },
    { href: '/search', label: content.navSearch, icon: Search, key: 'Search' },
    { href: '/saved', label: content.navSaved, icon: Bookmark, key: 'Saved' },
    { href: '/flirting-zone', label: content.navFlirting, icon: Flame, key: 'Flirting' },
    { href: '/profile', label: content.navProfile, icon: User, key: 'Profile' },
  ], [content]);

  const handleComingSoon = (e: React.MouseEvent<HTMLAnchorElement>, labelKey: string) => {
    if (['Search', 'Saved'].includes(labelKey)) {
        e.preventDefault();
        toast({
            title: "Coming Soon!",
            description: `The ${labelKey} page is under construction.`,
        });
    }
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
