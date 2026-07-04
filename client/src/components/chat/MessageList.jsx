import { useEffect, useRef, useMemo } from 'react';
import MessageBubble from './MessageBubble';
import Spinner from '@/components/ui/Spinner';
import { useMessages, flattenMessages } from '@/features/chat/useChat';
import { useAuth } from '@/hooks/useAuth';

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

  // The other member's lastReadAt (private seen receipts).
  const otherLastReadAt = useMemo(() => {
    if (!conversation || conversation.type !== 'private') return null;
    const other = conversation.members?.find(
      (m) => String(m.user._id || m.user) !== String(user?._id)
    );
    return other?.lastReadAt ? new Date(other.lastReadAt) : null;
  }, [conversation, user?._id]);

  // Auto-scroll to bottom when a new message arrives.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last._id !== lastIdRef.current) {
      lastIdRef.current = last._id;
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  }, [messages]);

  // Load older when scrolled to top.
  const onScroll = (e) => {
    if (e.target.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      const prevHeight = e.target.scrollHeight;
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
    <div ref={containerRef} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner size={18} className="text-brand-600" />
        </div>
      )}
      {messages.map((m, i) => {
        const isMine = String(m.sender._id || m.sender) === String(user?._id);
        const prev = messages[i - 1];
        const showAvatar = !prev || String(prev.sender._id || prev.sender) !== String(m.sender._id || m.sender);
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
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
