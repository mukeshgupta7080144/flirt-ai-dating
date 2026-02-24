import type { CapacitorConfig } from '@capacitor/cli';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config: CapacitorConfig = {
  appId: 'com.flirtai.pro.app',
  appName: 'Flirt AI',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      appId: process.env.NEXT_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-3062117589817701~1601738426',
    },
  },
};

export default config;
