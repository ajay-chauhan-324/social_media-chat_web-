import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import NewChatModal from '@/components/chat/NewChatModal';
import { cn } from '@/lib/cn';

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [newOpen, setNewOpen] = useState(false);

  const select = (id) => navigate(`/app/messages/${id}`);

  return (
    <div
      className={cn(
        // Mobile: full screen with a thread open (header+nav hidden); otherwise
        // fit between the mobile header and bottom nav. Desktop: minus top bar.
        conversationId ? 'h-[100dvh]' : 'h-[calc(100dvh-8rem)]',
        'lg:h-[calc(100vh-4rem)]'
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden border-x border-line bg-surface">
        {/* Conversation list — hidden on mobile when a chat is open */}
        <div className={cn('w-full shrink-0 sm:w-80 md:w-96', conversationId && 'hidden sm:block')}>
          <ConversationList activeId={conversationId} onSelect={select} onNew={() => setNewOpen(true)} />
        </div>

        {/* Chat window */}
        <div className={cn('min-w-0 flex-1', !conversationId && 'hidden sm:block')}>
          {conversationId ? (
            <ChatWindow
              key={conversationId}
              conversationId={conversationId}
              onBack={() => navigate('/app/messages')}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-surface-2 text-center">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-brand-gradient text-white">
                <FiMessageCircle size={36} />
              </div>
              <h2 className="font-display text-xl font-extrabold text-content">Your Messages</h2>
              <p className="mt-1 max-w-xs text-muted">
                Select a conversation or start a new one to begin chatting in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      <NewChatModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={select} />
    </div>
  );
}
