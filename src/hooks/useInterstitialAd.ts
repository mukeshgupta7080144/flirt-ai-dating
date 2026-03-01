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

  const [isInterstitialLoaded, setInterstitialLoaded] = useState(false);
  const [isInterstitialLoading, setInterstitialLoading] = useState(false);
  const [isRewardedLoaded, setRewardedLoaded] = useState(false);
  const [isRewardedLoading, setRewardedLoading] = useState(false);

  const syncInterstitialState = (loaded: boolean, loading: boolean) => {
    interstitialState.current = { loaded, loading };
    setInterstitialLoaded(loaded);
    setInterstitialLoading(loading);
  };

  const syncRewardedState = (loaded: boolean, loading: boolean) => {
    rewardedState.current = { loaded, loading };
    setRewardedLoaded(loaded);
    setRewardedLoading(loading);
  };

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
  }, [isAndroid]);

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
  }, [isAndroid]);

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

  const showBanner = async () => {
    if (!isAndroid) return;

    try {
      await AdMob.showBanner({
        adId: ADMOB_CONFIG.BANNER_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });
    } catch (err) {
      console.error('Banner show error:', err);
    }
  };

  const hideBanner = async () => {
    if (!isAndroid) return;

    try {
      await AdMob.hideBanner();
      await AdMob.removeBanner();
    } catch (err) {
      console.error('Banner hide error:', err);
    }
  };

  /* ================= INIT ================= */

  useEffect(() => {
    if (!isAndroid || isInitialized.current) return;

    isMounted.current = true;

    const init = async () => {
      try {
        await AdMob.initialize({});
        isInitialized.current = true;

        /* ----- INTERSTITIAL EVENTS ----- */

        listeners.current.push(
          await AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
            if (!isMounted.current) return;
            syncInterstitialState(true, false);
          }),

          await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
            if (!isMounted.current) return;
            syncInterstitialState(false, false);
          }),

          await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
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
          })
        );

        /* ----- REWARDED EVENTS ----- */

        listeners.current.push(
          await AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
            if (!isMounted.current) return;
            syncRewardedState(true, false);
          }),

          await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
            if (!isMounted.current) return;
            syncRewardedState(false, false);
          }),

          await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            if (isRewardShowing.current && rewardCallback.current) {
              try {
                rewardCallback.current();
              } catch (e) {
                console.error('Reward callback error:', e);
              }
              rewardCallback.current = null;
            }
          }),

          await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            if (!isMounted.current) return;

            syncRewardedState(false, false);

            rewardCallback.current = null;
            isRewardShowing.current = false;

            setTimeout(() => {
              if (isMounted.current) preloadRewardedAd();
            }, 1000);
          })
        );

        preloadInterstitial();
        preloadRewardedAd();
      } catch (err) {
        console.error('AdMob init error:', err);
      }
    };

    init();

    return () => {
      isMounted.current = false;
      isInitialized.current = false;
      listeners.current.forEach((l) => l.remove());
      listeners.current = [];
    };
  }, [isAndroid, preloadInterstitial, preloadRewardedAd]);

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