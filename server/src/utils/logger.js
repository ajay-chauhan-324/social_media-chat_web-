/* Minimal, dependency-free structured logger with colored levels. */
import env from '../config/env.js';

const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

const stamp = () => new Date().toISOString();

const format = (color, level, args) => {
  const prefix = `${COLORS.gray}${stamp()}${COLORS.reset} ${color}${level}${COLORS.reset}`;
  return [prefix, ...args];
};

const logger = {
  info: (...args) => console.log(...format(COLORS.cyan, 'INFO ', args)),
  warn: (...args) => console.warn(...format(COLORS.yellow, 'WARN ', args)),
  error: (...args) => console.error(...format(COLORS.red, 'ERROR', args)),
  success: (...args) => console.log(...format(COLORS.green, 'OK   ', args)),
  debug: (...args) => {
    if (!env.isProd) console.log(...format(COLORS.gray, 'DEBUG', args));
  },
};

export default logger;
