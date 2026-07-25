import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import ApiError from '../utils/ApiError.js';
import * as conversationService from '../services/conversation.service.js';
import * as messageService from '../services/message.service.js';

const PROFILE_FIELDS = 'name username avatar bio headline location website skills followersCount followingCount postsCount role';
const clampLimit = (v, def, max) => Math.min(Math.max(Number(v) || def, 1), max);

const previewContent = (content) => {
  const t = content.trim();
  return t.length > 300 ? `${t.slice(0, 300)}…` : t;
};

/** Format a message for the model — never leak raw ids, deleted content, etc. */
const toSafeMessage = (m, viewerId) => ({
  from: String(m.sender?._id || m.sender) === String(viewerId) ? 'me' : m.sender?.username || 'them',
  content: m.isDeleted ? '[deleted message]' : m.type === 'image' ? m.content || '[image]' : m.content,
  at: m.createdAt,
});

// ── Read-only tools (safe to auto-execute) ──────────────────────────────────

const getCurrentUserProfile = async (user) => {
  const fresh = await User.findById(user.id).select(PROFILE_FIELDS).lean();
  return fresh;
};

const getRecentConversations = async (user, { limit } = {}) => {
  const conversations = await conversationService.listConversations(user.id);
  return conversations.slice(0, clampLimit(limit, 5, 10)).map((c) => ({
    title: c.title,
    otherUsername: c.otherUser?.username || null,
    type: c.type,
    lastMessagePreview: c.lastMessage?.content ? previewContent(c.lastMessage.content) : c.lastMessage?.type === 'image' ? '[image]' : null,
    unreadCount: c.unreadCount,
    updatedAt: c.lastMessageAt,
  }));
};

const getUnreadMessagesCount = async (user) => {
  const conversations = await conversationService.listConversations(user.id);
  const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  return { unreadCount: total };
};

const searchUsers = async (user, { query } = {}) => {
  const q = (query || '').trim();
  if (!q) return { users: [] };
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = { $regex: safe, $options: 'i' };
  const users = await User.find({
    _id: { $ne: user.id },
    isBanned: false,
    $or: [{ name: rx }, { username: rx }],
  })
    .select('name username headline isVerified')
    .limit(5)
    .lean();
  return { users };
};

const findOtherUser = async (username) => {
  const target = await User.findOne({ username: String(username || '').toLowerCase().trim() }).select('_id name username');
  if (!target) throw ApiError.notFound(`No user found with username "${username}"`);
  return target;
};

const getConversation = async (user, { username } = {}) => {
  const target = await findOtherUser(username);
  if (String(target._id) === String(user.id)) throw ApiError.badRequest('You cannot message yourself');

  const pairKey = Conversation.pairKeyFor(user.id, target._id);
  const conv = await Conversation.findOne({ pairKey });
  if (!conv) return { found: false, message: `No existing conversation with @${target.username} yet.` };

  const { messages } = await messageService.getMessages(conv._id, user.id, { skip: 0, limit: 10 });
  return {
    found: true,
    withUser: target.username,
    messages: messages.map((m) => toSafeMessage(m, user.id)),
  };
};

const READ_ONLY_TOOLS = {
  get_current_user_profile: getCurrentUserProfile,
  get_recent_conversations: getRecentConversations,
  get_unread_messages_count: getUnreadMessagesCount,
  search_users: searchUsers,
  get_conversation: getConversation,
};

/** Runs any tool the model called EXCEPT ones requiring confirmation. */
export const executeTool = async (user, name, args) => {
  const fn = READ_ONLY_TOOLS[name];
  if (!fn) throw ApiError.badRequest(`Unknown tool: ${name}`);
  return fn(user, args || {});
};

// ── Confirmation-gated tools ─────────────────────────────────────────────────

/** Validates a send_message request and builds a human-readable preview — does NOT send anything. */
export const prepareSendMessage = async (user, { username, content } = {}) => {
  const text = String(content || '').trim();
  if (!text) throw ApiError.badRequest('Message content is required');
  const target = await findOtherUser(username);
  if (String(target._id) === String(user.id)) throw ApiError.badRequest('You cannot message yourself');
  return {
    tool: 'send_message',
    args: { username: target.username, content: text },
    preview: `Send **@${target.username}**: "${previewContent(text)}"`,
  };
};

/** Actually sends the message — only ever called after explicit user confirmation. */
export const executeConfirmedAction = async (user, pendingAction) => {
  if (pendingAction.tool !== 'send_message') throw ApiError.badRequest('Unknown pending action');
  const { username, content } = pendingAction.args;
  // Reuses the existing follow-gated conversation flow — same rules as the chat UI.
  const conversation = await conversationService.getOrCreatePrivate(user.id, username);
  const message = await messageService.sendMessage(conversation._id, user.id, { content });
  return { sent: true, to: username, content: message.content };
};
