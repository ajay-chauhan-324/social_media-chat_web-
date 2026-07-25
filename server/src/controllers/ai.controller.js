import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as aiService from '../services/ai.service.js';
import env from '../config/env.js';

export const getTools = asyncHandler(async (_req, res) => {
  const tools = Object.entries(aiService.TOOLS).map(([key, v]) => ({ key, label: v.label }));
  return ApiResponse.ok(res, { tools, aiEnabled: env.gemini.enabled }, 'AI tools');
});

export const chat = asyncHandler(async (req, res) => {
  const conversation = await aiService.chat(req.user, req.body);
  return ApiResponse.ok(res, { conversation }, 'AI reply');
});

/** Confirm or cancel a pending AI action (e.g. send_message) before it executes. */
export const confirmAction = asyncHandler(async (req, res) => {
  const conversation = await aiService.resolvePendingAction(req.user, req.body.conversationId, req.body.confirm);
  return ApiResponse.ok(res, { conversation }, 'Action resolved');
});

export const runTool = asyncHandler(async (req, res) => {
  const data = await aiService.runTool(req.user.id, req.body);
  return ApiResponse.ok(res, data, 'Generated');
});

export const listHistory = asyncHandler(async (req, res) => {
  const { conversations, meta } = await aiService.listHistory(req.user.id, req.query);
  return ApiResponse.ok(res, { conversations }, 'AI history', meta);
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await aiService.getConversation(req.user.id, req.params.id);
  return ApiResponse.ok(res, { conversation }, 'Conversation');
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const data = await aiService.deleteConversation(req.user.id, req.params.id);
  return ApiResponse.ok(res, data, 'Conversation deleted');
});

export const clearHistory = asyncHandler(async (req, res) => {
  const data = await aiService.clearHistory(req.user.id);
  return ApiResponse.ok(res, data, 'History cleared');
});
