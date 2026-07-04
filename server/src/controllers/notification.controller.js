import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as notificationService from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const { notifications, unread, meta } = await notificationService.listNotifications(
    req.user.id,
    req.query
  );
  return ApiResponse.ok(res, { notifications, unread }, 'Notifications', meta);
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user.id);
  return ApiResponse.ok(res, { count }, 'Unread count');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  return ApiResponse.ok(res, null, 'All notifications marked read');
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user.id);
  return ApiResponse.ok(res, { notification }, 'Marked read');
});
