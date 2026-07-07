/** Compact relative time: "now", "5m", "3h", "2d", or a date. */
export const timeAgo = (date) => {
  const d = new Date(date);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 45) return 'now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** 1200 → "1.2K", 3_400_000 → "3.4M". */
export const formatCount = (n = 0) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};

// Server origin for locally-stored uploads: VITE_API_URL minus the trailing
// "/api". Empty in dev (Vite proxy forwards /uploads to the backend).
const MEDIA_BASE = (import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

/** Resolve a possibly-relative upload URL against the backend origin. */
export const resolveMedia = (url = '') => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  // Relative path from local/mock storage — resolve against the backend so it
  // works on a split deploy (frontend and backend on different origins).
  return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};
