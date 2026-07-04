import jwt from 'jsonwebtoken';
import ms from '../utils/ms.js';
import env from '../config/env.js';
import Token from '../models/Token.js';
import { randomToken, hashToken } from '../utils/crypto.js';

/** Sign a short-lived access token. */
export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  });

/**
 * Issue an opaque refresh token, persist its hash (for revocation), and return
 * the raw value to set as an httpOnly cookie.
 */
export const issueRefreshToken = async (user, { userAgent = '', ip = '' } = {}) => {
  const raw = randomToken(48);
  const expiresAt = new Date(Date.now() + ms(env.jwt.refreshExpires));
  await Token.create({
    user: user.id,
    tokenHash: hashToken(raw),
    type: 'refresh',
    userAgent,
    ip,
    expiresAt,
  });
  return { raw, expiresAt };
};

/** Validate a refresh token against the store and return its record. */
export const findRefreshToken = (raw) =>
  Token.findOne({ tokenHash: hashToken(raw), type: 'refresh' });

/** Rotate: delete the old refresh token so it can't be replayed. */
export const revokeRefreshToken = (raw) =>
  Token.deleteOne({ tokenHash: hashToken(raw), type: 'refresh' });

/** Revoke every refresh token for a user (logout-all). */
export const revokeAllForUser = (userId) =>
  Token.deleteMany({ user: userId, type: 'refresh' });

/** Create a single-use verify/reset token and return the raw value + expiry. */
export const createSingleUseToken = async (user, type, ttlMs) => {
  await Token.deleteMany({ user: user.id, type }); // invalidate previous
  const raw = randomToken(32);
  const expiresAt = new Date(Date.now() + ttlMs);
  await Token.create({ user: user.id, tokenHash: hashToken(raw), type, expiresAt });
  return raw;
};

export const consumeSingleUseToken = async (raw, type) => {
  const record = await Token.findOne({ tokenHash: hashToken(raw), type });
  if (!record) return null;
  await record.deleteOne();
  return record;
};
