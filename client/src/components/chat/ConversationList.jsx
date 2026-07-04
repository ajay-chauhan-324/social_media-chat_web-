import { useState } from 'react';
import { FiEdit, FiSearch } from 'react-icons/fi';
import ConversationItem from './ConversationItem';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { FiMessageCircle } from 'react-icons/fi';
import { useConversations } from '@/features/chat/useChat';
import { useAuth } from '@/hooks/useAuth';

export default function ConversationList({ activeId, onSelect, onNew }) {
  const { data: conversations, isLoading } = useConversations();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const filtered = (conversations || []).filter((c) => {
    if (!q.trim()) return true;
    const other = c.members?.find((m) => String(m.user._id || m.user) !== String(user?._id))?.user;
    const hay = `${c.title} ${other?.username || ''}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between px-4 py-3.5">
        <h1 className="font-display text-xl font-extrabold text-content">Messages</h1>
        <button
          onClick={onNew}
          className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-white shadow-glow transition active:scale-95"
          aria-label="New conversation"
        >
          <FiEdit size={17} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations…"
            className="input-base h-10 pl-9"
          />
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size={24} className="text-brand-600" /></div>
        ) : filtered.length ? (
          filtered.map((c) => (
            <ConversationItem
              key={c._id}
              conversation={c}
              active={c._id === activeId}
              onClick={() => onSelect(c._id)}
            />
          ))
        ) : (
          <EmptyState
            icon={FiMessageCircle}
            title={q ? 'No matches' : 'No conversations yet'}
            description={q ? 'Try a different search.' : 'Start a new chat to connect with people.'}
          />
        )}
      </div>
    </div>
  );
}
