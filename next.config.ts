import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ottimizzazioni per build più veloce
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Disabilita Turbopack - next-pwa richiede webpack
  // Configurazione webpack per compatibilità next-pwa
  webpack: (config: any, { isServer }: any) => {
    // Ottimizzazioni webpack per build più veloce
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
};

// PWA configurato per essere più veloce
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disabilita PWA in sviluppo per debug più veloce
  buildExcludes: [/middleware-manifest\.json$/],
  // Ottimizzazioni PWA per build più veloce
  sw: "sw.js",
  fallbacks: {
    document: "/offline",
  },
  // Disabilita workbox precaching per build più veloce (opzionale)
  // runtimeCaching: [],
});

export default pwaConfig(nextConfig);
