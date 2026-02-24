/**
 * @fileOverview Centralized configuration for AdMob IDs.
 * Reads from environment variables and provides fallbacks to Google's test IDs for development.
 * This ensures no hardcoded IDs are in the application code.
 */

const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

export const ADMOB_CONFIG = {
    APP_ID: process.env.NEXT_PUBLIC_ADMOB_APP_ID || TEST_APP_ID,
    BANNER_ID: process.env.NEXT_PUBLIC_ADMOB_BANNER_ID || TEST_BANNER_ID,
    INTERSTITIAL_ID: process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID || TEST_INTERSTITIAL_ID,
    REWARDED_ID: process.env.NEXT_PUBLIC_ADMOB_REWARDED_ID || TEST_REWARDED_ID,
};
