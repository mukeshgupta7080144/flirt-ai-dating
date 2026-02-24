
'use client';

import { useAdMob } from '@/hooks/useInterstitialAd';
import React, { createContext, useContext, useEffect } from 'react';

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

/**
 * Provides the ad functionality to the entire app.
 * This should wrap the main layout.
 */
export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const adMobApi = useAdMob();

  useEffect(() => {
    // Preload ads when the provider mounts
    adMobApi.preloadInterstitial();
    adMobApi.preloadRewardedAd();
  }, [adMobApi]);

  return <AdContext.Provider value={adMobApi}>{children}</AdContext.Provider>;
};

/**
 * Custom hook to easily access ad functions from any component.
 */
export const useAds = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
