'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AdMob, AdOptions, InterstitialAdPluginEvents, RewardAdPluginEvents, AdLoadInfo } from '@capacitor-community/admob';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ADMOB_CONFIG } from '@/config/admob';

/**
 * A React custom hook to manage Interstitial, Banner, and Rewarded Ads with AdMob.
 * Updated to fix the 'Loading Ad' hang by removing strict ID matching in listeners.
 */
export const useAdMob = () => {
  const isInitialized = useRef(false);
  const listeners = useRef<PluginListenerHandle[]>([]);
  const onRewardCallback = useRef<() => void>(() => {});

  // Interstitial State
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isInterstitialLoading, setIsInterstitialLoading] = useState(false);

  // Rewarded Ad State
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);
  const [isRewardedLoading, setIsRewardedLoading] = useState(false);

  // --- INTERSTITIAL LOGIC ---
  const preloadInterstitial = useCallback(async () => {
    if (isInterstitialLoading || isInterstitialLoaded || Capacitor.getPlatform() !== 'android') return;
    console.log('AdManager: Preloading Interstitial Ad...');
    setIsInterstitialLoading(true);
    try {
      const options: AdOptions = { adId: ADMOB_CONFIG.INTERSTITIAL_ID, isTesting: true };
      await AdMob.prepareInterstitial(options);
    } catch (error) {
      console.error('AdManager: Failed to prepare Interstitial ad.', error);
      setIsInterstitialLoading(false);
    }
  }, [isInterstitialLoading, isInterstitialLoaded]);

  const showInterstitial = useCallback(async (onDismiss?: () => void) => {
    if (Capacitor.getPlatform() !== 'android') {
        onDismiss?.();
        return;
    }
    if (isInterstitialLoaded) {
      await AdMob.showInterstitial();
      if (onDismiss) {
        const listener = await AdMob.addListener(InterstitialAdPluginEvents.onAdDismissed, () => {
          onDismiss();
          listener.remove();
        });
      }
    } else {
      if (!isInterstitialLoading) preloadInterstitial();
      onDismiss?.();
    }
  }, [isInterstitialLoaded, isInterstitialLoading, preloadInterstitial]);

  // --- BANNER LOGIC ---
  const showBanner = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
        await AdMob.showBanner({
            adId: ADMOB_CONFIG.BANNER_ID,
            adSize: 'ADAPTIVE_BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: true,
        });
    } catch(error) {
        console.error('AdManager: Banner failed.', error);
    }
  }, []);

  const hideBanner = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
        await AdMob.hideBanner();
        await AdMob.removeBanner();
    } catch(error) {
        console.error('AdManager: Hide banner failed.', error);
    }
  }, []);

  // --- REWARDED VIDEO LOGIC ---
  const preloadRewardedAd = useCallback(async () => {
    if (isRewardedLoading || isRewardedLoaded || Capacitor.getPlatform() !== 'android') return;
    console.log('AdManager: Preloading Rewarded Ad...');
    setIsRewardedLoading(true);
    try {
      const options: AdOptions = { adId: ADMOB_CONFIG.REWARDED_ID, isTesting: true };
      await AdMob.prepareRewardVideoAd(options);
    } catch (error) {
      console.error('AdManager: Failed to prepare Rewarded ad.', error);
      setIsRewardedLoading(false);
    }
  }, [isRewardedLoading, isRewardedLoaded]);

  const showRewardedAd = useCallback(async (onRewarded: () => void) => {
    if (Capacitor.getPlatform() !== 'android') {
        onRewarded(); 
        return;
    }
    if (isRewardedLoaded) {
      onRewardCallback.current = onRewarded;
      await AdMob.showRewardVideoAd();
    } else {
      console.warn('AdManager: Rewarded ad not ready. Retrying preload...');
      if (!isRewardedLoading) preloadRewardedAd();
    }
  }, [isRewardedLoaded, isRewardedLoading, preloadRewardedAd]);

  // --- GLOBAL INITIALIZATION & LISTENERS (FIXED) ---
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || isInitialized.current) return;

    const setupAdMob = async () => {
      await AdMob.initialize({});
      isInitialized.current = true;

      // Interstitial Listeners
      const intLoaded = await AdMob.addListener(InterstitialAdPluginEvents.onAdLoaded, () => {
          setIsInterstitialLoaded(true);
          setIsInterstitialLoading(false);
      });
      const intFailed = await AdMob.addListener(InterstitialAdPluginEvents.onAdFailedToLoad, () => {
          setIsInterstitialLoaded(false);
          setIsInterstitialLoading(false);
      });
      const intDismissed = await AdMob.addListener(InterstitialAdPluginEvents.onAdDismissed, () => {
          setIsInterstitialLoaded(false);
          preloadInterstitial();
      });

      // Rewarded Listeners (Properly Fixed without ID checks)
      const rewLoaded = await AdMob.addListener(RewardAdPluginEvents.onAdLoaded, () => {
          console.log('AdManager: Rewarded Ad Loaded Successfully!');
          setIsRewardedLoaded(true); // ✅ Fixed: Now it will always trigger
          setIsRewardedLoading(false);
      });
      const rewFailed = await AdMob.addListener(RewardAdPluginEvents.onAdFailedToLoad, (error) => {
          console.error('AdManager: Rewarded Failed to Load.', error);
          setIsRewardedLoaded(false);
          setIsRewardedLoading(false);
      });
      const rewEarned = await AdMob.addListener(RewardAdPluginEvents.onAdRewarded, (reward) => {
          console.log('AdManager: Reward earned:', reward);
          onRewardCallback.current();
          onRewardCallback.current = () => {}; 
      });
      const rewDismissed = await AdMob.addListener(RewardAdPluginEvents.onAdDismissed, () => {
          setIsRewardedLoaded(false);
          preloadRewardedAd();
      });

      listeners.current.push(intLoaded, intFailed, intDismissed, rewLoaded, rewFailed, rewEarned, rewDismissed);
    };

    setupAdMob();
    
    return () => {
      if (Capacitor.getPlatform() === 'android') {
        listeners.current.forEach(l => l.remove());
        listeners.current = [];
        hideBanner();
      }
    };
  }, [preloadInterstitial, preloadRewardedAd, hideBanner]);

  return {
    showInterstitialAd: showInterstitial,
    isInterstitialLoaded,
    isInterstitialLoading,
    preloadInterstitial,
    showBanner,
    hideBanner,
    preloadRewardedAd,
    showRewardedAd,
    isRewardedLoaded,
    isRewardedLoading,
  };
};