import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  scope: "/",
  sw: "sw.js",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "dia-d-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
