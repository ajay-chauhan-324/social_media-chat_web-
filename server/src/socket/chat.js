import { markRead } from '../services/conversation.service.js';
import { markMessagesRead } from '../services/message.service.js';

const room = (id) => `conversation:${id}`;

/**
 * Register per-socket chat event handlers. Message create/edit/delete are
 * emitted from the REST controllers (durable writes first); this module owns
 * the ephemeral realtime signals: typing, read receipts, and room joins.
 */
export const registerChatHandlers = (io, socket) => {
  const { userId } = socket;

  socket.on('conversation:join', ({ conversationId } = {}) => {
    if (conversationId) socket.join(room(conversationId));
  });

  socket.on('typing:start', ({ conversationId } = {}) => {
    if (!conversationId) return;
    socket.to(room(conversationId)).emit('typing', { conversationId, userId, isTyping: true });
  });

  socket.on('typing:stop', ({ conversationId } = {}) => {
    if (!conversationId) return;
    socket.to(room(conversationId)).emit('typing', { conversationId, userId, isTyping: false });
  });

  socket.on('message:read', async ({ conversationId } = {}) => {
    if (!conversationId) return;
    try {
      const payload = await markRead(conversationId, userId);
      await markMessagesRead(conversationId, userId);
      io.to(room(conversationId)).emit('message:read', payload);
    } catch {
      /* ignore invalid read acks */
    }
  });
};
