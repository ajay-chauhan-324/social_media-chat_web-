import { useRef, useState, useEffect, useCallback } from 'react';
import { FiSmile, FiImage, FiSend, FiX } from 'react-icons/fi';
import EmojiPicker from './EmojiPicker';
import Spinner from '@/components/ui/Spinner';
import { useSocket } from '@/context/SocketContext';
import { useSendMessage } from '@/features/chat/useChat';
import { cn } from '@/lib/cn';

export default function MessageComposer({ conversationId, replyTo, onClearReply }) {
  const { emit } = useSocket();
  const send = useSendMessage(conversationId);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileRef = useRef(null);
  const typingRef = useRef(false);
  const typingTimeout = useRef(null);

  // Stop typing + reset when switching conversations.
  useEffect(() => {
    setText('');
    setFiles([]);
    onClearReply?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const signalTyping = useCallback(() => {
    if (!typingRef.current) {
      typingRef.current = true;
      emit('typing:start', { conversationId });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      emit('typing:stop', { conversationId });
    }, 1500);
  }, [conversationId, emit]);

  const addFiles = (list) => {
    const incoming = Array.from(list).slice(0, 4 - files.length);
    setFiles((prev) => [...prev, ...incoming.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !files.length) return;
    const fd = new FormData();
    fd.append('content', text);
    if (replyTo) fd.append('replyTo', replyTo._id);
    files.forEach((f) => fd.append('images', f.file));

    setText('');
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    onClearReply?.();
    emit('typing:stop', { conversationId });
    typingRef.current = false;
    await send.mutateAsync(fd);
  };

  return (
    <div className="border-t border-line bg-surface px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg border-l-2 border-brand-500 bg-surface-2 px-3 py-1.5 text-sm">
          <div className="min-w-0">
            <span className="font-semibold text-brand-600">Replying to {replyTo.sender?.name}</span>
            <p className="truncate text-muted">{replyTo.content || 'Attachment'}</p>
          </div>
          <button onClick={onClearReply} className="text-muted hover:text-content" aria-label="Cancel reply">
            <FiX />
          </button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-2 flex gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img src={f.preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-danger text-white"
                aria-label="Remove"
              >
                <FiX size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="relative flex items-end gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-brand-600"
            aria-label="Emoji"
          >
            <FiSmile size={20} />
          </button>
          {showEmoji && (
            <EmojiPicker onPick={(e) => setText((t) => t + e)} onClose={() => setShowEmoji(false)} />
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={files.length >= 4}
          className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-brand-600 disabled:opacity-40"
          aria-label="Attach image"
        >
          <FiImage size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />

        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); signalTyping(); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); }
          }}
          rows={1}
          placeholder="Type a message…"
          className="input-base max-h-32 min-h-[42px] flex-1 resize-none py-2.5"
        />

        <button
          type="submit"
          disabled={(!text.trim() && !files.length) || send.isPending}
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-glow transition',
            'disabled:opacity-40 active:scale-95'
          )}
          aria-label="Send"
        >
          {send.isPending ? <Spinner size={18} /> : <FiSend size={18} />}
        </button>
      </form>
    </div>
  );
}
