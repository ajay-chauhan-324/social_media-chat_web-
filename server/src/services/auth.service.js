import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { otp6 } from '../utils/crypto.js';
import {
  signAccessToken,
  issueRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  createSingleUseToken,
  consumeSingleUseToken,
} from './token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';

const VERIFY_TTL = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL = 60 * 60 * 1000; // 1h

/** Default avatar from a deterministic seed so seeded/mock users still look real. */
const defaultAvatar = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export const registerUser = async ({ name, username, email, password }) => {
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    const field = exists.email === email ? 'email' : 'username';
    throw ApiError.conflict(`An account with that ${field} already exists`);
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    avatar: defaultAvatar(username),
  });

  // Fire-and-forget verification email (mocked to console when SMTP is off).
  const token = await createSingleUseToken(user, 'verify', VERIFY_TTL);
  await sendVerificationEmail(user, token);

  return user;
};

export const authenticate = async ({ identifier, password }) => {
  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { username: identifier.toLowerCase() };

  const user = await User.findOne(query).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (user.isBanned) throw ApiError.forbidden('Your account has been suspended');

  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });
  return user;
};

export const issueSession = async (user, ctx = {}) => {
  const accessToken = signAccessToken(user);
  const { raw: refreshToken } = await issueRefreshToken(user, ctx);
  return { accessToken, refreshToken };
};

export const rotateSession = async (rawRefresh, ctx = {}) => {
  if (!rawRefresh) throw ApiError.unauthorized('No refresh token provided');
  const record = await findRefreshToken(rawRefresh);
  if (!record) throw ApiError.unauthorized('Invalid or expired session');

  await revokeRefreshToken(rawRefresh); // rotation
  const user = await User.findById(record.user);
  if (!user || user.isBanned) throw ApiError.unauthorized('Session no longer valid');

  return issueSession(user, ctx).then((tokens) => ({ user, ...tokens }));
};

export const endSession = (rawRefresh) =>
  rawRefresh ? revokeRefreshToken(rawRefresh) : Promise.resolve();

export const verifyEmail = async (token) => {
  const record = await consumeSingleUseToken(token, 'verify');
  if (!record) throw ApiError.badRequest('Invalid or expired verification link');
  const user = await User.findByIdAndUpdate(record.user, { isVerified: true }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  // Always resolve the same way to avoid leaking which emails exist.
  if (!user) return { sent: true };
  const token = await createSingleUseToken(user, 'reset', RESET_TTL);
  await sendPasswordResetEmail(user, token);
  return { sent: true };
};

export const resetPassword = async (token, newPassword) => {
  const record = await consumeSingleUseToken(token, 'reset');
  if (!record) throw ApiError.badRequest('Invalid or expired reset link');
  const user = await User.findById(record.user).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  user.password = newPassword;
  await user.save();
  return user;
};

// Reserved for future OTP-based flows (kept here so callers have one import site).
export const generateOtp = otp6;
