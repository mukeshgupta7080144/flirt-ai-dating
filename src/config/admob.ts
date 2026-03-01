/**
 * @fileOverview Centralized configuration for AdMob IDs.
 * Uses test IDs in development.
 * Requires real IDs in production.
 */

const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

const isProd = process.env.NODE_ENV === 'production';

function getAdId(envKey: string, testId: string) {
    const value = process.env[envKey];

    if (isProd && !value) {
        console.error(`Missing AdMob ENV: ${envKey}`);
    }

    return value || testId;
}

export const ADMOB_CONFIG = {
    APP_ID: getAdId('NEXT_PUBLIC_ADMOB_APP_ID', TEST_APP_ID),
    BANNER_ID: getAdId('NEXT_PUBLIC_ADMOB_BANNER_ID', TEST_BANNER_ID),
    INTERSTITIAL_ID: getAdId('NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID', TEST_INTERSTITIAL_ID),
    REWARDED_ID: getAdId('NEXT_PUBLIC_ADMOB_REWARDED_ID', TEST_REWARDED_ID),
};