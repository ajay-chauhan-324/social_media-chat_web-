import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import ApiError from '../utils/ApiError.js';

const MEMBER_FIELDS = 'name username avatar headline isVerified lastActiveAt';

/** Shape a conversation for a given viewer: unread count + resolved title/avatar. */
const decorate = async (conv, viewerId) => {
  const obj = conv.toObject ? conv.toObject() : conv;
  const me = obj.members.find((m) => String(m.user._id || m.user) === String(viewerId));
  const lastReadAt = me?.lastReadAt || new Date(0);

  obj.unreadCount = await Message.countDocuments({
    conversation: obj._id,
    createdAt: { $gt: lastReadAt },
    sender: { $ne: viewerId },
    isDeleted: false,
  });

  if (obj.type === 'private') {
    const other = obj.members.find((m) => String(m.user._id || m.user) !== String(viewerId));
    obj.title = other?.user?.name || 'Conversation';
    obj.avatar = other?.user?.avatar || '';
    obj.otherUser = other?.user || null;
  } else {
    obj.title = obj.name || obj.members.map((m) => m.user?.name).filter(Boolean).join(', ');
  }
  obj.myLastReadAt = lastReadAt;
  return obj;
};

const populateConv = (query) =>
  query
    .populate('members.user', MEMBER_FIELDS)
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name username avatar' } });

export const getOrCreatePrivate = async (userId, otherUsername) => {
  const other = await User.findOne({ username: otherUsername }).select('_id');
  if (!other) throw ApiError.notFound('User not found');
  if (String(other._id) === String(userId)) throw ApiError.badRequest('You cannot message yourself');

  const pairKey = Conversation.pairKeyFor(userId, other._id);
  let conv = await Conversation.findOne({ pairKey });
  if (!conv) {
    // Messaging is follow-gated: you must follow someone to start a new chat.
    // Existing conversations are always reachable (no lock-out).
    const follows = await Follow.exists({ follower: userId, following: other._id });
    if (!follows) throw ApiError.forbidden('Follow this user before messaging them');

    conv = await Conversation.create({
      type: 'private',
      pairKey,
      members: [{ user: userId, role: 'member' }, { user: other._id, role: 'member' }],
      lastMessageAt: new Date(),
    });
  }
  conv = await populateConv(Conversation.findById(conv._id));
  return decorate(conv, userId);
};

export const createGroup = async (creatorId, { name, memberUsernames = [] }) => {
  if (!name?.trim()) throw ApiError.badRequest('Group name is required');
  const users = await User.find({ username: { $in: memberUsernames } }).select('_id');
  const memberIds = new Set(users.map((u) => String(u._id)));
  memberIds.add(String(creatorId));
  if (memberIds.size < 2) throw ApiError.badRequest('Add at least one other member');

  const members = [...memberIds].map((id) => ({
    user: id,
    role: String(id) === String(creatorId) ? 'admin' : 'member',
  }));

  let conv = await Conversation.create({
    type: 'group',
    name: name.trim(),
    createdBy: creatorId,
    members,
    lastMessageAt: new Date(),
  });
  conv = await populateConv(Conversation.findById(conv._id));
  return decorate(conv, creatorId);
};

export const listConversations = async (userId) => {
  const convs = await populateConv(
    Conversation.find({ 'members.user': userId }).sort({ lastMessageAt: -1 })
  );
  return Promise.all(convs.map((c) => decorate(c, userId)));
};

export const getConversation = async (conversationId, userId) => {
  if (!mongoose.isValidObjectId(conversationId)) throw ApiError.badRequest('Invalid conversation id');
  const conv = await populateConv(Conversation.findById(conversationId));
  if (!conv) throw ApiError.notFound('Conversation not found');
  const isMember = conv.members.some((m) => String(m.user._id) === String(userId));
  if (!isMember) throw ApiError.forbidden('You are not part of this conversation');
  return decorate(conv, userId);
};

/** Ensure viewer is a member and return the raw conversation (no decoration). */
export const assertMember = async (conversationId, userId) => {
  const conv = await Conversation.findOne({ _id: conversationId, 'members.user': userId });
  if (!conv) throw ApiError.forbidden('You are not part of this conversation');
  return conv;
};

export const markRead = async (conversationId, userId) => {
  const now = new Date();
  await Conversation.updateOne(
    { _id: conversationId, 'members.user': userId },
    { $set: { 'members.$.lastReadAt': now } }
  );
  return { conversationId, userId: String(userId), at: now };
};

export const addMembers = async (conversationId, userId, memberUsernames = []) => {
  const conv = await assertMember(conversationId, userId);
  if (conv.type !== 'group') throw ApiError.badRequest('Can only add members to a group');

  const users = await User.find({ username: { $in: memberUsernames } }).select('_id');
  const existing = new Set(conv.members.map((m) => String(m.user)));
  users.forEach((u) => {
    if (!existing.has(String(u._id))) conv.members.push({ user: u._id, role: 'member' });
  });
  await conv.save();
  const populated = await populateConv(Conversation.findById(conv._id));
  return decorate(populated, userId);
};

/** Delete a conversation and all its messages. Any member may delete it. */
export const deleteConversation = async (conversationId, userId) => {
  const conv = await assertMember(conversationId, userId);
  const ids = conv.members.map((m) => String(m.user._id || m.user));
  await Message.deleteMany({ conversation: conv._id });
  await Conversation.findByIdAndDelete(conv._id);
  return { conversationId: String(conversationId), memberIds: ids };
};

export const leaveGroup = async (conversationId, userId) => {
  const conv = await assertMember(conversationId, userId);
  if (conv.type !== 'group') throw ApiError.badRequest('You can only leave groups');
  conv.members = conv.members.filter((m) => String(m.user) !== String(userId));
  await conv.save();
  return { left: true };
};

/** Ids of all members (used to fan out socket events). */
export const memberIds = (conv) => conv.members.map((m) => String(m.user._id || m.user));
