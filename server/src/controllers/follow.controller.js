import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as followService from '../services/follow.service.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const follow = asyncHandler(async (req, res) => {
  const data = await followService.followUser(req.user.id, req.params.username.toLowerCase());
  return ApiResponse.ok(res, data, 'Following');
});

export const unfollow = asyncHandler(async (req, res) => {
  const data = await followService.unfollowUser(req.user.id, req.params.username.toLowerCase());
  return ApiResponse.ok(res, data, 'Unfollowed');
});

export const followers = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 20 });
  const { users, total } = await followService.getFollowers(
    req.params.username.toLowerCase(),
    req.user?.id,
    pg
  );
  return ApiResponse.ok(res, { users }, 'Followers', buildMeta({ ...pg, total }));
});

export const following = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 20 });
  const { users, total } = await followService.getFollowing(
    req.params.username.toLowerCase(),
    req.user?.id,
    pg
  );
  return ApiResponse.ok(res, { users }, 'Following', buildMeta({ ...pg, total }));
});

export const suggestions = asyncHandler(async (req, res) => {
  const users = await followService.getSuggestions(req.user.id, Number(req.query.limit) || 5);
  return ApiResponse.ok(res, { users }, 'Suggested users');
});
