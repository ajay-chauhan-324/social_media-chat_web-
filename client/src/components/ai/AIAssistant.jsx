import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCpu, FiMaximize2, FiTrash2 } from 'react-icons/fi';
import Spinner from '@/components/ui/Spinner';
import AIMessage from './AIMessage';
import AIPendingAction from './AIPendingAction';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useAIChat } from '@/features/ai/useAI';

const SUGGESTIONS = [
  'Write a caption for a sunset photo',
  'Explain React hooks simply',
  'Generate 10 hashtags for fitness',
  'Give me a professional bio',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [input, setInput] = useState('');
  const chat = useAIChat();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || chat.isPending) return;
    setInput('');
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    try {
      const conversation = await chat.mutateAsync({ conversationId, message: msg, tool: 'assistant' });
      setConversationId(conversation._id);
      setMessages(conversation.messages.map((m) => ({ role: m.role, content: m.content })));
      setPendingAction(conversation.pendingAction || null);
    } catch {
      setMessages((prev) => prev.slice(0, -1)); // roll back optimistic user msg
    }
  };

  const handleResolved = (conversation) => {
    setMessages(conversation.messages.map((m) => ({ role: m.role, content: m.content })));
    setPendingAction(null);
  };

  const reset = () => {
    setMessages([]);
    setConversationId(null);
    setPendingAction(null);
  };

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand-gradient text-white shadow-glow transition active:scale-95 lg:bottom-5 lg:right-5"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'ai'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
            {open ? <FiX size={24} /> : <FiCpu size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-40 right-4 z-40 flex h-[560px] max-h-[calc(100vh-12rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft lg:bottom-24 lg:right-5 lg:max-h-[calc(100vh-8rem)]"
          >
            <header className="flex items-center gap-2.5 border-b border-line bg-brand-gradient px-4 py-3 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <FiCpu size={18} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">ArtROOT AI</p>
                <p className="text-xs text-white/80">Your creative assistant</p>
              </div>
              {messages.length > 0 && (
                <button onClick={reset} title="New chat" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/15">
                  <FiTrash2 size={16} />
                </button>
              )}
              <Link to="/app/ai" onClick={() => setOpen(false)} title="Open AI Studio" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/15">
                <FiMaximize2 size={16} />
              </Link>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white">
                    <FiCpu size={26} />
                  </span>
                  <p className="font-semibold text-content">How can I help?</p>
                  <p className="mb-4 text-sm text-muted">Ask me anything, or try:</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="block w-full rounded-xl border border-line px-3 py-2 text-left text-sm text-content transition hover:border-brand-500 hover:bg-surface-2"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <AIMessage key={i} role={m.role} content={m.content} />
                  ))}
                  <AIPendingAction
                    conversationId={conversationId}
                    pendingAction={pendingAction}
                    onResolved={handleResolved}
                  />
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

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-end gap-2 border-t border-line p-3"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder="Ask ArtROOT AI…"
                className="input-base max-h-24 min-h-[42px] flex-1 resize-none py-2.5"
              />
              <button
                type="submit"
                disabled={!input.trim() || chat.isPending}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-white transition disabled:opacity-40 active:scale-95"
                aria-label="Send"
              >
                {chat.isPending ? <Spinner size={18} /> : <FiSend size={18} />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
