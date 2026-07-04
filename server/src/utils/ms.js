/**
 * Tiny duration parser: "15m" → 900000, "30d" → 2592000000.
 * Supports s, m, h, d, w. A bare number is treated as milliseconds.
 */
const UNITS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };

const ms = (value) => {
  if (typeof value === 'number') return value;
  const match = /^(\d+(?:\.\d+)?)\s*(s|m|h|d|w)?$/i.exec(String(value).trim());
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const amount = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  return unit === 'ms' ? amount : amount * UNITS[unit];
};

export default ms;
