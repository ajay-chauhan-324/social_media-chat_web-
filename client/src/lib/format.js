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

/** Resolve a possibly-relative upload URL against the API origin. */
export const resolveMedia = (url = '') => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return url; // Vite proxy forwards /uploads in dev; same-origin in prod
};
