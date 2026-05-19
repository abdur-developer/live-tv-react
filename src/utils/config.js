// src/utils/config.js
const USE_PROXY = true; // Development এ true, Production এ true (Vercel)

export const getStreamUrl = (originalUrl) => {
  if (USE_PROXY) {
    // Vercel Serverless Function প্রক্সি
    return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
};