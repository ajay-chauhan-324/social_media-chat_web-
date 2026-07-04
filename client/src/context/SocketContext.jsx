import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getAccessToken } from '@/lib/axios';
import { selectIsAuthenticated, selectUser } from '@/features/auth/authSlice';
import { chatKeys } from '@/features/chat/chatKeys';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const me = useSelector(selectUser);
  const qc = useQueryClient();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());

  // Append a realtime message into the (newest) first page of the infinite cache.
  const appendMessage = useCallback(
    (conversationId, message) => {
      qc.setQueryData(chatKeys.messages(conversationId), (data) => {
        if (!data?.pages?.length) return data;
        const pages = [...data.pages];
        const first = pages[0];
        if (first.data.messages.some((m) => m._id === message._id)) return data; // dedupe
        pages[0] = { ...first, data: { ...first.data, messages: [...first.data.messages, message] } };
        return { ...data, pages };
      });
    },
    [qc]
  );

  const patchMessage = useCallback(
    (conversationId, messageId, mutate) => {
      qc.setQueryData(chatKeys.messages(conversationId), (data) => {
        if (!data?.pages) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map((m) => (m._id === messageId ? mutate(m) : m)),
            },
          })),
        };
      });
    },
    [qc]
  );

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const token = getAccessToken();
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // ── Presence ──
    socket.on('presence:list', ({ online }) => setOnlineUsers(new Set(online)));
    socket.on('presence:online', ({ userId }) =>
      setOnlineUsers((prev) => new Set(prev).add(userId))
    );
    socket.on('presence:offline', ({ userId }) =>
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      })
    );

    // ── Messages ──
    socket.on('message:new', ({ conversationId, message }) => {
      appendMessage(conversationId, message);
    });
    socket.on('message:updated', ({ message }) => {
      patchMessage(message.conversation, message._id, () => message);
    });
    socket.on('message:deleted', ({ conversation, messageId }) => {
      patchMessage(conversation, messageId, (m) => ({
        ...m,
        isDeleted: true,
        content: '',
        images: [],
      }));
    });

    // ── Conversation list ──
    socket.on('conversation:update', ({ conversationId, lastMessage, lastMessageAt }) => {
      qc.setQueryData(chatKeys.conversations, (list) => {
        if (!list) return list;
        const idx = list.findIndex((c) => c._id === conversationId);
        if (idx === -1) {
          qc.invalidateQueries({ queryKey: chatKeys.conversations });
          return list;
        }
        const conv = { ...list[idx], lastMessage, lastMessageAt };
        // Bump unread if the message is from someone else.
        if (lastMessage && String(lastMessage.sender?._id || lastMessage.sender) !== String(me?._id)) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        const next = [conv, ...list.slice(0, idx), ...list.slice(idx + 1)];
        return next;
      });
    });
    socket.on('conversation:new', () => {
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
    });

    // ── Notifications ──
    socket.on('notification:new', () => {
      qc.setQueryData(['notifications', 'unread'], (n) => (n || 0) + 1);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, qc, appendMessage, patchMessage, me?._id]);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      connected,
      onlineUsers,
      isOnline: (userId) => onlineUsers.has(String(userId)),
      emit: (...args) => socketRef.current?.emit(...args),
    }),
    [connected, onlineUsers]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
