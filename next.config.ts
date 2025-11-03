import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disabilita Turbopack - next-pwa richiede webpack
  // Configurazione webpack per compatibilità next-pwa
  webpack: (config: any, { isServer }: any) => {
    return config;
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disabilita PWA in sviluppo per debug più veloce
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaConfig(nextConfig);
