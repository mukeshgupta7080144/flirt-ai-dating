"use client" // 👈 Ye lagana zaroori hai client-side logic ke liye

import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { AdProvider } from '@/providers/AdProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    // Android Hardware Back Button Listener
    const setupBackButton = async () => {
      await App.addListener('backButton', ({ canGoBack }) => {
        if (pathname === '/') {
          // Agar home page par ho toh app band kar do
          App.exitApp();
        } else {
          // Agar kisi sub-page par ho toh peeche jao
          window.history.back();
        }
      });
    };

    setupBackButton();

    // Clean up listener when component unmounts
    return () => {
      App.removeAllListeners();
    };
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <LanguageProvider>
          <AdProvider>
            <AppLayout>{children}</AppLayout>
          </AdProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}