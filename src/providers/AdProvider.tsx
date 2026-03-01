'use client';

import { useAdMob } from '@/hooks/useInterstitialAd';
import React, { createContext, useContext, useEffect, useMemo } from 'react';

interface AdContextType {
  showInterstitialAd: (onDismiss?: () => void) => void;
  isInterstitialLoaded: boolean;
  isInterstitialLoading: boolean;
  preloadInterstitial: () => Promise<void>;
  showBanner: () => void;
  hideBanner: () => void;
  preloadRewardedAd: () => Promise<void>;
  showRewardedAd: (onRewarded: () => void) => void;
  isRewardedLoaded: boolean;
  isRewardedLoading: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const adMobApi = useAdMob();

  /* 🔥 Preload only once on mount */
  useEffect(() => {
    adMobApi.preloadInterstitial();
    adMobApi.preloadRewardedAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 🔥 Memoize context value to prevent unnecessary re-renders */
  const contextValue = useMemo(() => adMobApi, [
    adMobApi.isInterstitialLoaded,
    adMobApi.isInterstitialLoading,
    adMobApi.isRewardedLoaded,
    adMobApi.isRewardedLoading,
  ]);

  return (
    <AdContext.Provider value={contextValue}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};