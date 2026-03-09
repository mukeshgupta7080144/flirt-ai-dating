'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AdMob,
  AdOptions,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  BannerAdSize,
  BannerAdPosition,
} from '@capacitor-community/admob';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { ADMOB_CONFIG } from '@/config/admob';

export const useAdMob = () => {
  const isAndroid = Capacitor.getPlatform() === 'android';

  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const listeners = useRef<PluginListenerHandle[]>([]);

  /* ---------------- STATE REFS ---------------- */

  const interstitialState = useRef({ loaded: false, loading: false });
  const rewardedState = useRef({ loaded: false, loading: false });

  const rewardCallback = useRef<(() => void) | null>(null);
  const isRewardShowing = useRef(false);
  const interstitialDismissQueue = useRef<(() => void)[]>([]);

  // ✅ FIX 1: बैनर के स्टेटस को ट्रैक करने के लिए (लाल एरर रोकने के लिए)
  const isBannerShowing = useRef(false);

  const [isInterstitialLoaded, setInterstitialLoaded] = useState(false);
  const [isInterstitialLoading, setInterstitialLoading] = useState(false);
  const [isRewardedLoaded, setRewardedLoaded] = useState(false);
  const [isRewardedLoading, setRewardedLoading] = useState(false);

  const syncInterstitialState = useCallback((loaded: boolean, loading: boolean) => {
    interstitialState.current = { loaded, loading };
    setInterstitialLoaded(loaded);
    setInterstitialLoading(loading);
  }, []);

  const syncRewardedState = useCallback((loaded: boolean, loading: boolean) => {
    rewardedState.current = { loaded, loading };
    setRewardedLoaded(loaded);
    setRewardedLoading(loading);
  }, []);

  /* ================= INTERSTITIAL ================= */

  const preloadInterstitial = useCallback(async () => {
    if (!isAndroid) return;
    if (interstitialState.current.loaded || interstitialState.current.loading) return;

    try {
      syncInterstitialState(false, true);

      const options: AdOptions = {
        adId: ADMOB_CONFIG.INTERSTITIAL_ID,
        isTesting: false,
      };

      await AdMob.prepareInterstitial(options);
    } catch (err) {
      console.error('Interstitial preload error:', err);
      syncInterstitialState(false, false);
    }
  }, [isAndroid, syncInterstitialState]);

  const showInterstitialAd = useCallback(
    async (onDismiss?: () => void) => {
      if (!isAndroid) {
        onDismiss?.();
        return;
      }

      if (!interstitialState.current.loaded) {
        await preloadInterstitial();
        onDismiss?.();
        return;
      }

      try {
        if (onDismiss) {
          interstitialDismissQueue.current.push(onDismiss);
        }

        await AdMob.showInterstitial();
      } catch (err) {
        console.error('Interstitial show error:', err);
        const cb = interstitialDismissQueue.current.shift();
        cb?.();
      }
    },
    [isAndroid, preloadInterstitial]
  );

  /* ================= REWARDED ================= */

  const preloadRewardedAd = useCallback(async () => {
    if (!isAndroid) return;
    if (rewardedState.current.loaded || rewardedState.current.loading) return;

    try {
      syncRewardedState(false, true);

      const options: AdOptions = {
        adId: ADMOB_CONFIG.REWARDED_ID,
        isTesting: false,
      };

      await AdMob.prepareRewardVideoAd(options);
    } catch (err) {
      console.error('Rewarded preload error:', err);
      syncRewardedState(false, false);
    }
  }, [isAndroid, syncRewardedState]);

  const showRewardedAd = useCallback(
    async (onReward: () => void) => {
      if (!isAndroid) {
        onReward();
        return;
      }

      if (isRewardShowing.current) return;

      if (!rewardedState.current.loaded) {
        await preloadRewardedAd();
        return;
      }

      try {
        isRewardShowing.current = true;
        rewardCallback.current = onReward;
        await AdMob.showRewardVideoAd();
      } catch (err) {
        console.error('Rewarded show error:', err);
        rewardCallback.current = null;
        isRewardShowing.current = false;
      }
    },
    [isAndroid, preloadRewardedAd]
  );

  /* ================= BANNER ================= */

  const showBanner = useCallback(async () => {
    if (!isAndroid) return;
    if (isBannerShowing.current) return; // अगर पहले से दिख रहा है, तो दोबारा कॉल मत करो

    try {
      await AdMob.showBanner({
        adId: ADMOB_CONFIG.BANNER_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
      // ✅ FIX 1: बैनर दिख गया, इसे true कर दो
      isBannerShowing.current = true; 
    } catch (err) {
      console.error('Banner show error:', err);
    }
  }, [isAndroid]);

  const hideBanner = useCallback(async () => {
    if (!isAndroid) return;
    
    // ✅ FIX 1: अगर बैनर दिख ही नहीं रहा है, तो छुपाने की कोशिश मत करो (यहीं से वापस लौट जाओ)
    if (!isBannerShowing.current) return; 

    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
      // ✅ FIX 1: बैनर हट गया, इसे false कर दो
      isBannerShowing.current = false; 
    } catch (err) {
      console.error('Banner hide error:', err);
    }
  }, [isAndroid]);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!isAndroid) return;

    isMounted.current = true;

    const init = async () => {
      // ✅ FIX 2: डुप्लीकेट Listeners को रोकने के लिए चेक
      if (isInitialized.current) return;

      try {
        await AdMob.initialize({});
        isInitialized.current = true;

        /* ----- INTERSTITIAL EVENTS ----- */

        const interstitialLoad = await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
          if (!isMounted.current) return;
          syncInterstitialState(true, false);
        });

        const interstitialFailed = await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
          if (!isMounted.current) return;
          syncInterstitialState(false, false);
        });

        const interstitialDismissed = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
          if (!isMounted.current) return;

          syncInterstitialState(false, false);

          const cb = interstitialDismissQueue.current.shift();
          try {
            cb?.();
          } catch (e) {
            console.error('Dismiss callback error:', e);
          }

          setTimeout(() => {
            if (isMounted.current) preloadInterstitial();
          }, 1000);
        });

        /* ----- REWARDED EVENTS ----- */

        const rewardedLoad = await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
          if (!isMounted.current) return;
          syncRewardedState(true, false);
        });

        const rewardedFailed = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
          if (!isMounted.current) return;
          syncRewardedState(false, false);
        });

        const rewardedEarned = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
          if (isRewardShowing.current && rewardCallback.current) {
            try {
              rewardCallback.current();
            } catch (e) {
              console.error('Reward callback error:', e);
            }
            rewardCallback.current = null;
          }
        });

        const rewardedDismissed = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
          if (!isMounted.current) return;

          syncRewardedState(false, false);
          rewardCallback.current = null;
          isRewardShowing.current = false;

          setTimeout(() => {
            if (isMounted.current) preloadRewardedAd();
          }, 1000);
        });

        // ✅ FIX 2: सारे Listeners को एक Array में सेव कर लिया ताकि बाद में क्लिनअप कर सकें
        listeners.current = [
          interstitialLoad,
          interstitialFailed,
          interstitialDismissed,
          rewardedLoad,
          rewardedFailed,
          rewardedEarned,
          rewardedDismissed
        ];

        preloadInterstitial();
        preloadRewardedAd();
      } catch (err) {
        console.error('AdMob init error:', err);
        isInitialized.current = false; // अगर एरर आया, तो रीसेट कर दो
      }
    };

    init();

    // ✅ FIX 2: पक्का क्लिनअप (Cleanup) ताकि मेमोरी लीक न हो
    return () => {
      isMounted.current = false;
      isInitialized.current = false;
      
      // पुराने सारे इवेंट्स को डिलीट कर दो
      listeners.current.forEach(async (listener) => {
        try {
           await listener.remove();
        } catch(e) {
           console.error("Failed to remove listener", e);
        }
      });
      listeners.current = [];
    };
  }, [isAndroid, preloadInterstitial, preloadRewardedAd, syncInterstitialState, syncRewardedState]);

  return {
    showInterstitialAd,
    preloadInterstitial,
    isInterstitialLoaded,
    isInterstitialLoading,
    showRewardedAd,
    preloadRewardedAd,
    isRewardedLoaded,
    isRewardedLoading,
    showBanner,
    hideBanner,
  };
};