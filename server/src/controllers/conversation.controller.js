import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as convService from '../services/conversation.service.js';
import { joinUsersToConversation, emitToUsers } from '../socket/index.js';

export const startPrivate = asyncHandler(async (req, res) => {
  const conv = await convService.getOrCreatePrivate(req.user.id, req.body.username.toLowerCase());
  const ids = conv.members.map((m) => String(m.user._id));
  joinUsersToConversation(ids, conv._id);
  // Notify the other participant a conversation now exists.
  emitToUsers(
    ids.filter((id) => id !== String(req.user.id)),
    'conversation:new',
    { conversationId: String(conv._id) }
  );
  return ApiResponse.ok(res, { conversation: conv }, 'Conversation ready');
});

export const createGroup = asyncHandler(async (req, res) => {
  const conv = await convService.createGroup(req.user.id, req.body);
  const ids = conv.members.map((m) => String(m.user._id));
  joinUsersToConversation(ids, conv._id);
  emitToUsers(ids, 'conversation:new', { conversationId: String(conv._id) });
  return ApiResponse.created(res, { conversation: conv }, 'Group created');
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await convService.listConversations(req.user.id);
  return ApiResponse.ok(res, { conversations }, 'Conversations');
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await convService.getConversation(req.params.id, req.user.id);
  return ApiResponse.ok(res, { conversation }, 'Conversation');
});

export const markRead = asyncHandler(async (req, res) => {
  const data = await convService.markRead(req.params.id, req.user.id);
  return ApiResponse.ok(res, data, 'Marked read');
});

export const addMembers = asyncHandler(async (req, res) => {
  const conversation = await convService.addMembers(req.params.id, req.user.id, req.body.usernames);
  const ids = conversation.members.map((m) => String(m.user._id));
  joinUsersToConversation(ids, conversation._id);
  emitToUsers(ids, 'conversation:new', { conversationId: String(conversation._id) });
  return ApiResponse.ok(res, { conversation }, 'Members added');
});

export const leaveGroup = asyncHandler(async (req, res) => {
  const data = await convService.leaveGroup(req.params.id, req.user.id);
  return ApiResponse.ok(res, data, 'Left group');
});
