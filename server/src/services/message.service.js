import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import ApiError from '../utils/ApiError.js';
import { assertMember } from './conversation.service.js';
import { uploadImages, destroyImage } from './upload.service.js';

const SENDER_FIELDS = 'name username avatar isVerified';

const populateMessage = (query) =>
  query
    .populate('sender', SENDER_FIELDS)
    .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } })
    .populate('reactions.user', 'name username avatar');

export const sendMessage = async (conversationId, senderId, { content = '', replyTo }, files = []) => {
  await assertMember(conversationId, senderId);
  const images = files.length ? await uploadImages(files, 'chat') : [];
  if (!content.trim() && !images.length) throw ApiError.badRequest('Message cannot be empty');

  let message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    type: images.length ? 'image' : 'text',
    content,
    images,
    replyTo: replyTo || null,
    readBy: [senderId],
  });

  // Bump conversation preview + ordering.
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: message.createdAt,
  });

  message = await populateMessage(Message.findById(message._id));
  return message.toObject();
};

export const getMessages = async (conversationId, userId, { skip, limit }) => {
  await assertMember(conversationId, userId);
  const [messages, total] = await Promise.all([
    populateMessage(
      Message.find({ conversation: conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ),
    Message.countDocuments({ conversation: conversationId }),
  ]);
  // Return in chronological order for rendering.
  return { messages: messages.map((m) => m.toObject()).reverse(), total };
};

export const editMessage = async (messageId, userId, content) => {
  const message = await Message.findById(messageId);
  if (!message) throw ApiError.notFound('Message not found');
  if (String(message.sender) !== String(userId)) throw ApiError.forbidden('Not your message');
  if (message.isDeleted) throw ApiError.badRequest('Cannot edit a deleted message');
  message.content = content;
  message.editedAt = new Date();
  await message.save();
  const populated = await populateMessage(Message.findById(messageId));
  return populated.toObject();
};

export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw ApiError.notFound('Message not found');
  if (String(message.sender) !== String(userId)) throw ApiError.forbidden('Not your message');

  await Promise.all(message.images.map((img) => destroyImage(img.publicId)));
  message.isDeleted = true;
  message.content = '';
  message.images = [];
  await message.save();
  return { messageId: String(messageId), conversation: String(message.conversation) };
};

export const togglePin = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw ApiError.notFound('Message not found');
  await assertMember(message.conversation, userId);
  message.isPinned = !message.isPinned;
  await message.save();
  const populated = await populateMessage(Message.findById(messageId));
  return populated.toObject();
};

/**
 * Toggle the caller's emoji reaction on a message. One reaction per user:
 * reacting with the same emoji removes it; a different emoji replaces it.
 */
export const toggleReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw ApiError.notFound('Message not found');
  if (message.isDeleted) throw ApiError.badRequest('Cannot react to a deleted message');
  await assertMember(message.conversation, userId);

  const mine = message.reactions.find((r) => String(r.user) === String(userId));
  message.reactions = message.reactions.filter((r) => String(r.user) !== String(userId));
  if (!mine || mine.emoji !== emoji) message.reactions.push({ user: userId, emoji });

  await message.save();
  const populated = await populateMessage(Message.findById(messageId));
  return populated.toObject();
};

export const getPinned = async (conversationId, userId) => {
  await assertMember(conversationId, userId);
  const pinned = await populateMessage(
    Message.find({ conversation: conversationId, isPinned: true, isDeleted: false }).sort({
      createdAt: -1,
    })
  );
  return pinned.map((m) => m.toObject());
};

export const searchMessages = async (conversationId, userId, q) => {
  await assertMember(conversationId, userId);
  if (!q?.trim()) return [];
  const results = await populateMessage(
    Message.find({
      conversation: conversationId,
      isDeleted: false,
      content: { $regex: q.trim(), $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(30)
  );
  return results.map((m) => m.toObject());
};

/** Mark all messages in a conversation as read by user (for group seen-by). */
export const markMessagesRead = async (conversationId, userId) => {
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
};
