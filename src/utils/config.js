// src/utils/config.js
const USE_PROXY = true; // সবসময় true রাখুন Vercel-এ

export const getStreamUrl = (originalUrl) => {
  if (USE_PROXY && window.location.hostname.includes('vercel.app')) {
    // Vercel deployment এ প্রক্সি ব্যবহার
    return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
};