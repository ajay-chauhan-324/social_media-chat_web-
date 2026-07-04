import crypto from 'crypto';

/** Cryptographically-random URL-safe token (for email verify / password reset). */
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

/** SHA-256 hash — store hashed tokens so a DB leak can't be replayed. */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/** 6-digit numeric OTP (email verification codes). */
export const otp6 = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
