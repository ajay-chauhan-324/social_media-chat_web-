import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import Spinner from '@/components/ui/Spinner';
import { useMessages, flattenMessages } from '@/features/chat/useChat';
import { useAuth } from '@/hooks/useAuth';

const NEAR_BOTTOM_PX = 120;

const dayLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function MessageList({ conversationId, conversation, onReply }) {
  const { user } = useAuth();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(conversationId);
  const messages = flattenMessages(data);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const lastIdRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [newCount, setNewCount] = useState(0);

  // The other member's lastReadAt (private seen receipts).
  const otherLastReadAt = useMemo(() => {
    if (!conversation || conversation.type !== 'private') return null;
    const other = conversation.members?.find(
      (m) => String(m.user._id || m.user) !== String(user?._id)
    );
    return other?.lastReadAt ? new Date(other.lastReadAt) : null;
  }, [conversation, user?._id]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    setNewCount(0);
    setAtBottom(true);
  }, []);

  // Keep the latest message pinned when the on-screen keyboard opens/closes
  // (the visual viewport resizes) — only if the user was already at the bottom.
  const atBottomRef = useRef(true);
  useEffect(() => {
    atBottomRef.current = atBottom;
  }, [atBottom]);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onResize = () => {
      if (atBottomRef.current) requestAnimationFrame(() => scrollToBottom('auto'));
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, [scrollToBottom]);

  // Auto-scroll only when the user is already near the bottom or the new
  // message is their own — otherwise keep their scroll position and surface a
  // "new messages" pill instead of yanking them down.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last._id === lastIdRef.current) return;
    const isFirstLoad = lastIdRef.current === null;
    lastIdRef.current = last._id;

    const mine = String(last.sender._id || last.sender) === String(user?._id);
    if (isFirstLoad || atBottom || mine) {
      requestAnimationFrame(() => scrollToBottom(isFirstLoad ? 'auto' : 'smooth'));
    } else {
      setNewCount((c) => c + 1);
    }
  }, [messages, atBottom, user?._id, scrollToBottom]);

  const onScroll = (e) => {
    const el = e.target;

    // Track proximity to the bottom for the scroll-to-bottom pill.
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distance < NEAR_BOTTOM_PX;
    setAtBottom(near);
    if (near) setNewCount(0);

    // Load older messages when scrolled near the top, preserving position.
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      const prevHeight = el.scrollHeight;
      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (containerRef.current)
            containerRef.current.scrollTop = containerRef.current.scrollHeight - prevHeight;
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={26} className="text-brand-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center text-muted">
        <div className="mb-3 text-4xl">👋</div>
        <p className="font-medium text-content">Say hello!</p>
        <p className="text-sm">This is the start of your conversation.</p>
      </div>
    );
  }

  const isGroup = conversation?.type === 'group';
  let lastDay = null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={containerRef} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Spinner size={18} className="text-brand-600" />
          </div>
        )}
        {messages.map((m, i) => {
          const isMine = String(m.sender._id || m.sender) === String(user?._id);
          const prev = messages[i - 1];
          const showAvatar =
            !prev || String(prev.sender._id || prev.sender) !== String(m.sender._id || m.sender);
          const seen = isMine && otherLastReadAt && otherLastReadAt >= new Date(m.createdAt);

          const day = dayLabel(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;

          return (
            <div key={m._id}>
              {showDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
                    {day}
                  </span>
                </div>
              )}
              <MessageBubble
                message={m}
                isMine={isMine}
                isGroup={isGroup}
                showAvatar={showAvatar}
                seen={seen}
                onReply={onReply}
                myId={user?._id}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Floating scroll-to-bottom button with new-message count */}
      <AnimatePresence>
        {!atBottom && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onClick={() => scrollToBottom()}
            aria-label="Scroll to latest messages"
            className="absolute bottom-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-content shadow-soft"
          >
            <FiChevronDown size={20} />
            {newCount > 0 && (
              <span className="absolute -top-1.5 left-1/2 grid h-5 min-w-[20px] -translate-x-1/2 place-items-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold leading-none text-white">
                {newCount > 99 ? '99+' : newCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
