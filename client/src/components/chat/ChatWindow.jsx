import { useEffect, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';
import { useConversation, useMarkRead } from '@/features/chat/useChat';
import { useMessages } from '@/features/chat/useChat';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';

export default function ChatWindow({ conversationId, onBack }) {
  const { data: conversation, isLoading } = useConversation(conversationId);
  const { socket, emit } = useSocket();
  const { user } = useAuth();
  const markRead = useMarkRead();
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> true
  const { data: msgData } = useMessages(conversationId);

  // Announce read on open and whenever new messages come in.
  useEffect(() => {
    if (!conversationId) return;
    emit('message:read', { conversationId });
    markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, msgData?.pages?.[0]?.data?.messages?.length]);

  // Typing events for this conversation.
  useEffect(() => {
    if (!socket) return undefined;
    const handler = ({ conversationId: cid, userId, isTyping }) => {
      if (cid !== conversationId || String(userId) === String(user?._id)) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = true;
        else delete next[userId];
        return next;
      });
    };
    socket.on('typing', handler);
    return () => socket.off('typing', handler);
  }, [socket, conversationId, user?._id]);

  // Reset typing when switching conversations.
  useEffect(() => setTypingUsers({}), [conversationId]);

  if (isLoading || !conversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={26} className="text-brand-600" />
      </div>
    );
  }

  const typingIds = Object.keys(typingUsers);
  const typingLabel = (() => {
    if (!typingIds.length) return null;
    const names = typingIds
      .map((id) => conversation.members?.find((m) => String(m.user._id || m.user) === id)?.user?.name)
      .filter(Boolean);
    if (conversation.type === 'private') return `${conversation.title.split(' ')[0]} is typing`;
    if (names.length === 1) return `${names[0]} is typing`;
    return `${names.length} people are typing`;
  })();

  return (
    <div className="flex h-full flex-col">
      <ChatHeader conversation={conversation} onBack={onBack} />
      <MessageList conversationId={conversationId} conversation={conversation} onReply={setReplyTo} />
      <div className="h-5">{typingLabel && <TypingIndicator label={typingLabel} />}</div>
      <MessageComposer
        conversationId={conversationId}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
      />
    </div>
  );
}
