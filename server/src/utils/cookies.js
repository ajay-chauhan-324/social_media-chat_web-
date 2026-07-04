import env from '../config/env.js';
import ms from './ms.js';

const REFRESH_COOKIE = 'refreshToken';

const baseOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
});

export const setRefreshCookie = (res, raw) => {
  res.cookie(REFRESH_COOKIE, raw, {
    ...baseOptions(),
    maxAge: ms(env.jwt.refreshExpires),
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, baseOptions());
};

export const readRefreshCookie = (req) => req.cookies?.[REFRESH_COOKIE] || null;

export { REFRESH_COOKIE };
