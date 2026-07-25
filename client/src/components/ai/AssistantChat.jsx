import { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiPlus, FiSearch, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import AIMessage from './AIMessage';
import AIPendingAction from './AIPendingAction';
import TypingIndicator from '@/components/chat/TypingIndicator';
import {
  useAIHistory,
  useAIConversation,
  useAIChat,
  useDeleteConversation,
} from '@/features/ai/useAI';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function AssistantChat() {
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const syncedId = useRef(null);
  const scrollRef = useRef(null);

  const { data: history } = useAIHistory(search);
  const { data: conversation } = useAIConversation(activeId);
  const chat = useAIChat();
  const del = useDeleteConversation();

  // Sync messages when a stored conversation loads.
  useEffect(() => {
    if (conversation && conversation._id !== syncedId.current) {
      syncedId.current = conversation._id;
      setMessages(conversation.messages.map((m) => ({ role: m.role, content: m.content })));
      setPendingAction(conversation.pendingAction || null);
    }
  }, [conversation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const newChat = () => {
    setActiveId(null);
    setMessages([]);
    setPendingAction(null);
    syncedId.current = null;
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || chat.isPending) return;
    setInput('');
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    try {
      const conv = await chat.mutateAsync({ conversationId: activeId, message: msg, tool: 'assistant' });
      syncedId.current = conv._id;
      setActiveId(conv._id);
      setMessages(conv.messages.map((m) => ({ role: m.role, content: m.content })));
      setPendingAction(conv.pendingAction || null);
    } catch {
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleResolved = (conv) => {
    setMessages(conv.messages.map((m) => ({ role: m.role, content: m.content })));
    setPendingAction(null);
  };

  const openConversation = (id) => {
    setActiveId(id);
    syncedId.current = null; // force resync
  };

  const removeConversation = (e, id) => {
    e.stopPropagation();
    del.mutate(id, {
      onSuccess: () => {
        if (id === activeId) newChat();
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-13rem)] gap-4">
      {/* History sidebar */}
      <div className="hidden w-64 shrink-0 flex-col rounded-2xl border border-line bg-surface md:flex">
        <div className="p-3">
          <Button variant="gradient" fullWidth size="sm" leftIcon={<FiPlus />} onClick={newChat}>
            New chat
          </Button>
          <div className="relative mt-2">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history…"
              className="input-base h-9 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {history?.length ? (
            history.map((h) => (
              <button
                key={h._id}
                onClick={() => openConversation(h._id)}
                className={cn(
                  'group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition',
                  activeId === h._id ? 'bg-brand-600/10' : 'hover:bg-surface-2'
                )}
              >
                <FiMessageSquare size={14} className="shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-content">{h.title}</p>
                  <p className="text-xs text-muted">{timeAgo(h.updatedAt)}</p>
                </div>
                <span
                  onClick={(e) => removeConversation(e, h._id)}
                  className="opacity-0 transition hover:text-danger group-hover:opacity-100"
                >
                  <FiTrash2 size={13} />
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-surface">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white">
                <FiCpu size={30} />
              </span>
              <h3 className="font-display text-lg font-bold text-content">Ask ArtROOT AI anything</h3>
              <p className="max-w-sm text-sm text-muted">
                Coding help, career advice, writing, translations — your conversations are saved automatically.
              </p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <AIMessage key={i} role={m.role} content={m.content} />
              ))}
              <AIPendingAction conversationId={activeId} pendingAction={pendingAction} onResolved={handleResolved} />
              {chat.isPending && (
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-gradient text-white">
                    <FiCpu size={14} />
                  </span>
                  <div className="rounded-2xl rounded-bl-md bg-surface-2 px-2">
                    <TypingIndicator label="thinking" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t border-line p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Message ArtROOT AI…"
            className="input-base max-h-32 min-h-[44px] flex-1 resize-none py-3"
          />
          <button
            type="submit"
            disabled={!input.trim() || chat.isPending}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient text-white transition disabled:opacity-40 active:scale-95"
            aria-label="Send"
          >
            {chat.isPending ? <Spinner size={18} /> : <FiSend size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
