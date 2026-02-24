'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('hi');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('flirt-ai-language') as Language;
      if (savedLanguage && ['hi', 'en'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
        console.error("Could not access localStorage. Defaulting to 'hi'.", error);
        setLanguage('hi');
    }
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    try {
      localStorage.setItem('flirt-ai-language', lang);
      setLanguage(lang);
    } catch (error) {
      console.error("Could not access localStorage to set language.", error);
      setLanguage(lang); // Still update state even if localStorage fails
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    handleSetLanguage(language === 'hi' ? 'en' : 'hi');
  }, [language, handleSetLanguage]);

  const value = useMemo(() => ({
    language,
    toggleLanguage,
    setLanguage: handleSetLanguage
  }), [language, toggleLanguage, handleSetLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
