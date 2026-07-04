import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { registerChatHandlers } from './chat.js';

export const roomForConversation = (id) => `conversation:${id}`;
export const roomForUser = (id) => `user:${id}`;

/** Map of userId → Set of active socket ids (a user may have several tabs). */
const onlineUsers = new Map();

const addSocket = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeSocket = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return true; // fully offline
  }
  return false;
};

let io = null;

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const getOnlineUserIds = () => [...onlineUsers.keys()];

/** Emit an event to every socket a given user has open. */
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(roomForUser(userId)).emit(event, payload);
};

/** Emit to everyone currently in a conversation room. */
export const emitToConversation = (conversationId, event, payload, exceptSocketId) => {
  if (!io) return;
  const target = io.to(roomForConversation(conversationId));
  if (exceptSocketId) target.except(exceptSocketId);
  target.emit(event, payload);
};

/** Emit an event to a list of users (by id) — used to fan conversation updates. */
export const emitToUsers = (userIds = [], event, payload) => {
  if (!io) return;
  userIds.forEach((id) => io.to(roomForUser(id)).emit(event, payload));
};

/** Ask any sockets belonging to these users to join a conversation room. */
export const joinUsersToConversation = (userIds = [], conversationId) => {
  if (!io) return;
  userIds.forEach((id) =>
    io.in(roomForUser(id)).socketsJoin(roomForConversation(conversationId))
  );
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // Authenticate every connection via the access token.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, env.jwt.accessSecret);
      socket.userId = payload.sub;
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { userId } = socket;
    socket.join(roomForUser(userId));

    // Join a room for every conversation this user belongs to.
    try {
      const convs = await Conversation.find({ 'members.user': userId }).select('_id');
      convs.forEach((c) => socket.join(roomForConversation(c._id)));
    } catch {
      /* non-fatal */
    }

    const wasOffline = !onlineUsers.has(userId);
    addSocket(userId, socket.id);
    if (wasOffline) {
      io.emit('presence:online', { userId });
      await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).catch(() => {});
    }

    socket.emit('presence:list', { online: getOnlineUserIds() });
    registerChatHandlers(io, socket);
    logger.debug(`Socket connected: user=${userId} sid=${socket.id}`);

    socket.on('disconnect', async () => {
      const nowOffline = removeSocket(userId, socket.id);
      if (nowOffline) {
        io.emit('presence:offline', { userId });
        await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).catch(() => {});
      }
    });
  });

  logger.success('Socket.io initialized');
  return io;
};
