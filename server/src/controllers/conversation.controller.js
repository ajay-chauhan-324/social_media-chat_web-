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

// ── Public rooms ─────────────────────────────────────────────────────────────

export const listPublicRooms = asyncHandler(async (req, res) => {
  const rooms = await convService.listPublicRooms(req.user.id);
  return ApiResponse.ok(res, { rooms }, 'Public rooms');
});

export const createPublicRoom = asyncHandler(async (req, res) => {
  const conv = await convService.createPublicRoom(req.user.id, req.body);
  joinUsersToConversation([String(req.user.id)], conv._id);
  // Let every connected client's room browser update live.
  emitToUsers([String(req.user.id)], 'conversation:new', { conversationId: String(conv._id) });
  return ApiResponse.created(res, { conversation: conv }, 'Room created');
});

export const joinPublicRoom = asyncHandler(async (req, res) => {
  const conv = await convService.joinPublicRoom(req.user.id, req.params.id);
  joinUsersToConversation([String(req.user.id)], conv._id);
  emitToUsers([String(req.user.id)], 'conversation:new', { conversationId: String(conv._id) });
  return ApiResponse.ok(res, { conversation: conv }, 'Joined room');
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

export const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId, memberIds } = await convService.deleteConversation(req.params.id, req.user.id);
  // Tell every member (incl. the deleter's other tabs) to drop it from the UI.
  emitToUsers(memberIds, 'conversation:deleted', { conversationId });
  return ApiResponse.ok(res, { conversationId }, 'Conversation deleted');
});
