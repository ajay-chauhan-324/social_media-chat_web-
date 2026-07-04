import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from '../utils/cookies.js';

const ctx = (req) => ({ userAgent: req.headers['user-agent'] || '', ip: req.ip });

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  const { accessToken, refreshToken } = await authService.issueSession(user, ctx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.created(res, { user, accessToken }, 'Account created — welcome to ArtROOT Chat!');
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.authenticate(req.body);
  const { accessToken, refreshToken } = await authService.issueSession(user, ctx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.ok(res, { user, accessToken }, 'Signed in successfully');
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = readRefreshCookie(req);
  const { user, accessToken, refreshToken } = await authService.rotateSession(raw, ctx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.ok(res, { user, accessToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.endSession(readRefreshCookie(req));
  clearRefreshCookie(res);
  return ApiResponse.ok(res, null, 'Signed out');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  return ApiResponse.ok(res, { user }, 'Email verified');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body.email);
  return ApiResponse.ok(
    res,
    null,
    'If an account exists for that email, a reset link is on its way'
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  return ApiResponse.ok(res, null, 'Password updated — you can now sign in');
});
