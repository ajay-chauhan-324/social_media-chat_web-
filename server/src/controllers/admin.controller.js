import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as adminService from '../services/admin.service.js';
import { deletePost as removePost } from '../services/post.service.js';
import { deleteComment as removeComment } from '../services/comment.service.js';

export const getStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getStats();
  return ApiResponse.ok(res, { stats }, 'Dashboard stats');
});

export const getCharts = asyncHandler(async (_req, res) => {
  const charts = await adminService.getCharts();
  return ApiResponse.ok(res, { charts }, 'Chart data');
});

export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await adminService.listUsers(req.query);
  return ApiResponse.ok(res, { users }, 'Users', meta);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  return ApiResponse.ok(res, { user }, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  const data = await adminService.deleteUser(req.params.id);
  return ApiResponse.ok(res, data, 'User deleted');
});

export const listPosts = asyncHandler(async (req, res) => {
  const { posts, meta } = await adminService.listPosts(req.query);
  return ApiResponse.ok(res, { posts }, 'Posts', meta);
});

export const deletePost = asyncHandler(async (req, res) => {
  const data = await removePost(req.params.id, req.user.id, true);
  return ApiResponse.ok(res, data, 'Post deleted');
});

export const listComments = asyncHandler(async (req, res) => {
  const { comments, meta } = await adminService.listComments(req.query);
  return ApiResponse.ok(res, { comments }, 'Comments', meta);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const data = await removeComment(req.params.id, req.user.id, true);
  return ApiResponse.ok(res, data, 'Comment deleted');
});

export const listReports = asyncHandler(async (req, res) => {
  const { reports, meta } = await adminService.listReports(req.query);
  return ApiResponse.ok(res, { reports }, 'Reports', meta);
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await adminService.resolveReport(req.params.id, req.user.id, req.body.status);
  return ApiResponse.ok(res, { report }, 'Report updated');
});

export const getAiUsage = asyncHandler(async (req, res) => {
  const { histories, byTool, byDay, meta } = await adminService.getAiUsage(req.query);
  return ApiResponse.ok(res, { histories, byTool, byDay }, 'AI usage', meta);
});
