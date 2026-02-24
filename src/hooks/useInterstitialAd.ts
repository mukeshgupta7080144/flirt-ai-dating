'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AdMob, AdOptions, InterstitialAdPluginEvents, RewardAdPluginEvents, AdLoadInfo } from '@capacitor-community/admob';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ADMOB_CONFIG } from '@/config/admob';

/**
 * A React custom hook to manage Interstitial, Banner, and Rewarded Ads with AdMob.
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

  // --- INTERSTITIAL ---
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
        console.warn('AdManager: Ads are only supported on native platforms.');
        onDismiss?.();
        return;
    }
    if (isInterstitialLoaded) {
      console.log('AdManager: Showing Interstitial Ad...');
      await AdMob.showInterstitial();
      // The onAdDismissed listener will handle preloading the next one.
      if (onDismiss) {
        const listener = await AdMob.addListener(InterstitialAdPluginEvents.onAdDismissed, () => {
          onDismiss();
          listener.remove();
        });
      }
    } else {
      console.warn('AdManager: Interstitial ad is not loaded yet. Trying to preload again.');
      if (!isInterstitialLoading) {
        preloadInterstitial();
      }
      // If ad is not ready, still call the dismiss callback to not block the UI flow
      onDismiss?.();
    }
  }, [isInterstitialLoaded, isInterstitialLoading, preloadInterstitial]);


  // --- BANNER ---
  const showBanner = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    console.log('AdManager: Showing Banner Ad...');
    try {
        await AdMob.showBanner({
            adId: ADMOB_CONFIG.BANNER_ID,
            adSize: 'ADAPTIVE_BANNER',
            position: 'BOTTOM_CENTER',
            margin: 0,
            isTesting: true,
        });
    } catch(error) {
        console.error('AdManager: Failed to show Banner ad.', error);
    }
  }, []);

  const hideBanner = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'android') return;
    console.log('AdManager: Hiding Banner Ad...');
    try {
        await AdMob.hideBanner();
        await AdMob.removeBanner();
    } catch(error) {
        console.error('AdManager: Failed to hide/remove Banner ad.', error);
    }
  }, []);


  // --- REWARDED VIDEO ---
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
        console.warn('AdManager: Ads are only supported on web for testing. Granting reward.');
        onRewarded(); 
        return;
    }
    if (isRewardedLoaded) {
      console.log('AdManager: Showing Rewarded Ad...');
      onRewardCallback.current = onRewarded;
      await AdMob.showRewardVideoAd();
    } else {
      console.warn('AdManager: Rewarded ad is not loaded yet. Trying to preload again.');
      if (!isRewardedLoading) {
        preloadRewardedAd();
      }
    }
  }, [isRewardedLoaded, isRewardedLoading, preloadRewardedAd]);

  // --- GLOBAL INITIALIZATION & LISTENERS ---
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android' || isInitialized.current) return;

    const setupAdMob = async () => {
      await AdMob.initialize({});
      isInitialized.current = true;

      // Interstitial Listeners
      const interstitialLoaded = await AdMob.addListener(InterstitialAdPluginEvents.onAdLoaded, (info: AdLoadInfo) => {
        if (info.adUnitId === ADMOB_CONFIG.INTERSTITIAL_ID) {
            console.log('AdManager: Interstitial Ad Loaded.');
            setIsInterstitialLoaded(true);
            setIsInterstitialLoading(false);
        }
      });
      const interstitialFailed = await AdMob.addListener(InterstitialAdPluginEvents.onAdFailedToLoad, (error: any) => {
        if(error.adUnitId === ADMOB_CONFIG.INTERSTITIAL_ID){
            console.error('AdManager: Interstitial Ad Failed to Load.', error);
            setIsInterstitialLoaded(false);
            setIsInterstitialLoading(false);
        }
      });
      const interstitialDismissed = await AdMob.addListener(InterstitialAdPluginEvents.onAdDismissed, () => {
        console.log('AdManager: Interstitial Ad Dismissed. Preloading next ad...');
        setIsInterstitialLoaded(false);
        preloadInterstitial();
      });

      // Rewarded Listeners
      const rewardedLoaded = await AdMob.addListener(RewardAdPluginEvents.onAdLoaded, (info: AdLoadInfo) => {
        if(info.adUnitId === ADMOB_CONFIG.REWARDED_ID) {
            console.log('AdManager: Rewarded Ad Loaded.');
            setIsRewardedLoaded(true);
            setIsRewardedLoading(false);
        }
      });
      const rewardedFailed = await AdMob.addListener(RewardAdPluginEvents.onAdFailedToLoad, (error: any) => {
        if(error.adUnitId === ADMOB_CONFIG.REWARDED_ID) {
            console.error('AdManager: Rewarded Ad Failed to Load.', error);
            setIsRewardedLoaded(false);
            setIsRewardedLoading(false);
        }
      });
      const rewardedDismissed = await AdMob.addListener(RewardAdPluginEvents.onAdDismissed, () => {
        console.log('AdManager: Rewarded Ad Dismissed. Preloading next ad...');
        setIsRewardedLoaded(false);
        preloadRewardedAd();
      });
      const rewardedEarned = await AdMob.addListener(RewardAdPluginEvents.onAdRewarded, (reward) => {
        console.log('AdManager: User earned reward!', reward);
        onRewardCallback.current();
        onRewardCallback.current = () => {}; // Reset callback
      });
      
      listeners.current.push(
        interstitialLoaded, interstitialFailed, interstitialDismissed,
        rewardedLoaded, rewardedFailed, rewardedDismissed, rewardedEarned
      );
    };

    setupAdMob();
    
    return () => {
      if (Capacitor.getPlatform() === 'android') {
        listeners.current.forEach(listener => listener.remove());
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
