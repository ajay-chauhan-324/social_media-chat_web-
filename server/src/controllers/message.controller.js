import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as messageService from '../services/message.service.js';
import { assertMember, memberIds } from '../services/conversation.service.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { emitToConversation, emitToUsers } from '../socket/index.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { id: conversationId } = req.params;
  const message = await messageService.sendMessage(conversationId, req.user.id, req.body, req.files || []);

  // Realtime fan-out: message to the room, list-update to each member.
  emitToConversation(conversationId, 'message:new', { conversationId, message });
  const conv = await assertMember(conversationId, req.user.id);
  emitToUsers(memberIds(conv), 'conversation:update', {
    conversationId,
    lastMessage: message,
    lastMessageAt: message.createdAt,
  });

  return ApiResponse.created(res, { message }, 'Message sent');
});

export const getMessages = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 30, maxLimit: 60 });
  const { messages, total } = await messageService.getMessages(req.params.id, req.user.id, pg);
  return ApiResponse.ok(res, { messages }, 'Messages', buildMeta({ ...pg, total }));
});

export const editMessage = asyncHandler(async (req, res) => {
  const message = await messageService.editMessage(req.params.messageId, req.user.id, req.body.content);
  emitToConversation(message.conversation, 'message:updated', { message });
  return ApiResponse.ok(res, { message }, 'Message updated');
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const data = await messageService.deleteMessage(req.params.messageId, req.user.id);
  emitToConversation(data.conversation, 'message:deleted', data);
  return ApiResponse.ok(res, data, 'Message deleted');
});

export const togglePin = asyncHandler(async (req, res) => {
  const message = await messageService.togglePin(req.params.messageId, req.user.id);
  emitToConversation(message.conversation, 'message:updated', { message });
  return ApiResponse.ok(res, { message }, message.isPinned ? 'Pinned' : 'Unpinned');
});

export const reactMessage = asyncHandler(async (req, res) => {
  const message = await messageService.toggleReaction(
    req.params.messageId,
    req.user.id,
    req.body.emoji
  );
  // Reuse the existing message-update fan-out; clients patch it into cache.
  emitToConversation(message.conversation, 'message:updated', { message });
  return ApiResponse.ok(res, { message }, 'Reaction updated');
});

export const getPinned = asyncHandler(async (req, res) => {
  const messages = await messageService.getPinned(req.params.id, req.user.id);
  return ApiResponse.ok(res, { messages }, 'Pinned messages');
});

export const searchMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.searchMessages(req.params.id, req.user.id, req.query.q);
  return ApiResponse.ok(res, { messages }, 'Search results');
});
