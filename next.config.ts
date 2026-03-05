import type { NextConfig } from 'next';

// 🧠 SMART CHECK: क्या हम Vercel के सर्वर पर हैं?
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // ✅ FIX: Vercel पर Backend/API चालू रहेगा, और लैपटॉप पर Android के लिए 'export' होगा!
  output: isVercel ? undefined : 'export', 
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;