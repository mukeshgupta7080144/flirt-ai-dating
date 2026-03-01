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

  const interstitialDismissQueue = useRef<(() => void)[]>([]);
  const rewardQueue = useRef<(() => void)[]>([]);

  const [isInterstitialLoaded, setInterstitialLoaded] = useState(false);
  const [isInterstitialLoading, setInterstitialLoading] = useState(false);

  const [isRewardedLoaded, setRewardedLoaded] = useState(false);
  const [isRewardedLoading, setRewardedLoading] = useState(false);

  /* ---------------- INTERSTITIAL ---------------- */

  const preloadInterstitial = useCallback(async () => {
    if (!isAndroid) return;
    if (isInterstitialLoaded || isInterstitialLoading) return;

    try {
      setInterstitialLoading(true);

      const options: AdOptions = {
        adId: ADMOB_CONFIG.INTERSTITIAL_ID,
        isTesting: false,
      };

      await AdMob.prepareInterstitial(options);
    } catch (err) {
      console.error('Interstitial preload error:', err);
      setInterstitialLoading(false);
    }
  }, [isAndroid, isInterstitialLoaded, isInterstitialLoading]);

  const showInterstitialAd = useCallback(
    async (onDismiss?: () => void) => {
      if (!isAndroid) {
        onDismiss?.();
        return;
      }

      if (!isInterstitialLoaded) {
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
    [isAndroid, isInterstitialLoaded, preloadInterstitial]
  );

  /* ---------------- REWARDED ---------------- */

  const preloadRewardedAd = useCallback(async () => {
    if (!isAndroid) return;
    if (isRewardedLoaded || isRewardedLoading) return;

    try {
      setRewardedLoading(true);

      const options: AdOptions = {
        adId: ADMOB_CONFIG.REWARDED_ID,
        isTesting: false,
      };

      await AdMob.prepareRewardVideoAd(options);
    } catch (err) {
      console.error('Rewarded preload error:', err);
      setRewardedLoading(false);
    }
  }, [isAndroid, isRewardedLoaded, isRewardedLoading]);

  const showRewardedAd = useCallback(
    async (onReward: () => void) => {
      if (!isAndroid) {
        onReward();
        return;
      }

      if (!isRewardedLoaded) {
        await preloadRewardedAd();
        return;
      }

      try {
        rewardQueue.current = [];
        rewardQueue.current.push(onReward);

        await AdMob.showRewardVideoAd();
      } catch (err) {
        console.error('Rewarded show error:', err);
        rewardQueue.current = [];
      }
    },
    [isAndroid, isRewardedLoaded, preloadRewardedAd]
  );

  /* ---------------- BANNER (FIXED) ---------------- */

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

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!isAndroid || isInitialized.current) return;

    isMounted.current = true;

    const init = async () => {
      try {
        await AdMob.initialize({});
        isInitialized.current = true;

        listeners.current.push(
          await AdMob.addListener(
            InterstitialAdPluginEvents.Loaded,
            () => {
              if (!isMounted.current) return;
              setInterstitialLoaded(true);
              setInterstitialLoading(false);
            }
          ),
          await AdMob.addListener(
            InterstitialAdPluginEvents.FailedToLoad,
            () => {
              if (!isMounted.current) return;
              setInterstitialLoaded(false);
              setInterstitialLoading(false);
            }
          ),
          await AdMob.addListener(
            InterstitialAdPluginEvents.Dismissed,
            () => {
              if (!isMounted.current) return;
              setInterstitialLoaded(false);
              const cb = interstitialDismissQueue.current.shift();
              cb?.();
              setTimeout(() => preloadInterstitial(), 500);
            }
          )
        );

        listeners.current.push(
          await AdMob.addListener(
            RewardAdPluginEvents.Loaded,
            () => {
              if (!isMounted.current) return;
              setRewardedLoaded(true);
              setRewardedLoading(false);
            }
          ),
          await AdMob.addListener(
            RewardAdPluginEvents.FailedToLoad,
            () => {
              if (!isMounted.current) return;
              setRewardedLoaded(false);
              setRewardedLoading(false);
            }
          ),
          await AdMob.addListener(
            RewardAdPluginEvents.Dismissed,
            () => {
              if (!isMounted.current) return;
              setRewardedLoaded(false);
              rewardQueue.current = [];
              setTimeout(() => preloadRewardedAd(), 500);
            }
          ),
          await AdMob.addListener(
            RewardAdPluginEvents.Rewarded,
            () => {
              const cb = rewardQueue.current.shift();
              cb?.();
            }
          )
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
      listeners.current.forEach((l) => l.remove());
      listeners.current = [];
    };
  }, []);

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