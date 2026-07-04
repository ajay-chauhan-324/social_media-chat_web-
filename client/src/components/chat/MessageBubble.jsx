import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMoreVertical, FiEdit2, FiTrash2, FiCornerUpLeft, FiCheck } from 'react-icons/fi';
import { RiPushpin2Fill, RiCheckDoubleFill, RiCheckLine } from 'react-icons/ri';
import Avatar from '@/components/ui/Avatar';
import { resolveMedia, timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useEditMessage, useDeleteMessage, usePinMessage } from '@/features/chat/useChat';

function BubbleMenu({ isMine, canEdit, onEdit, onReply, onPin, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-7 w-7 place-items-center rounded-full text-muted opacity-0 transition hover:bg-surface-2 group-hover:opacity-100"
        aria-label="Message options"
      >
        <FiMoreVertical size={16} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'absolute z-20 mt-1 w-36 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-soft',
            isMine ? 'right-0' : 'left-0'
          )}
        >
          <button onClick={() => { setOpen(false); onReply(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-content hover:bg-surface-2">
            <FiCornerUpLeft size={14} /> Reply
          </button>
          <button onClick={() => { setOpen(false); onPin(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-content hover:bg-surface-2">
            <RiPushpin2Fill size={14} /> Pin
          </button>
          {isMine && canEdit && (
            <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-content hover:bg-surface-2">
              <FiEdit2 size={14} /> Edit
            </button>
          )}
          {isMine && (
            <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-surface-2">
              <FiTrash2 size={14} /> Delete
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function MessageBubble({ message, isMine, isGroup, showAvatar, seen, onReply }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const edit = useEditMessage();
  const del = useDeleteMessage();
  const pin = usePinMessage();

  const saveEdit = () => {
    const text = draft.trim();
    if (text && text !== message.content) edit.mutate({ id: message._id, content: text });
    setEditing(false);
  };

  const deleted = message.isDeleted;

  return (
    <div className={cn('group flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {isGroup && !isMine && (
        <div className="w-8 shrink-0">
          {showAvatar && <Avatar src={message.sender.avatar} name={message.sender.name} size="xs" />}
        </div>
      )}

      <div className={cn('flex max-w-[75%] flex-col', isMine ? 'items-end' : 'items-start')}>
        {isGroup && !isMine && showAvatar && (
          <span className="mb-0.5 px-1 text-xs font-semibold text-brand-600">{message.sender.name}</span>
        )}

        <div className={cn('flex items-center gap-1', isMine && 'flex-row-reverse')}>
          <div
            className={cn(
              'relative rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed',
              isMine
                ? 'rounded-br-md bg-brand-600 text-white'
                : 'rounded-bl-md bg-surface-2 text-content'
            )}
          >
            {message.isPinned && (
              <RiPushpin2Fill className={cn('absolute -top-2', isMine ? '-left-2 text-brand-400' : '-right-2 text-brand-600')} size={13} />
            )}

            {/* Reply preview */}
            {message.replyTo && !deleted && (
              <div className={cn('mb-1 rounded-lg border-l-2 px-2 py-1 text-xs', isMine ? 'border-white/50 bg-white/10' : 'border-brand-500 bg-surface')}>
                <span className="font-semibold">{message.replyTo.sender?.name || 'User'}</span>
                <p className="line-clamp-2 opacity-80">{message.replyTo.content || 'Attachment'}</p>
              </div>
            )}

            {deleted ? (
              <span className="italic opacity-70">This message was deleted</span>
            ) : editing ? (
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  className="min-w-[160px] resize-none rounded-lg bg-white/20 px-2 py-1 text-white outline-none placeholder:text-white/60"
                />
                <button onClick={saveEdit} className="rounded-full bg-white/25 p-1"><FiCheck size={14} /></button>
              </div>
            ) : (
              <>
                {message.images?.length > 0 && (
                  <div className={cn('grid gap-1', message.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1', message.content && 'mb-1.5')}>
                    {message.images.map((img, i) => (
                      <img key={i} src={resolveMedia(img.url)} alt="" className="max-h-60 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                {message.content && <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>}
              </>
            )}
          </div>

          {!deleted && <BubbleMenu isMine={isMine} canEdit={message.type === 'text'} onEdit={() => { setDraft(message.content); setEditing(true); }} onReply={() => onReply(message)} onPin={() => pin.mutate(message._id)} onDelete={() => del.mutate(message._id)} />}
        </div>

        <div className={cn('mt-0.5 flex items-center gap-1 px-1 text-[11px] text-muted', isMine && 'flex-row-reverse')}>
          <span>{timeAgo(message.createdAt)}</span>
          {message.editedAt && !deleted && <span>· edited</span>}
          {isMine && !deleted && (
            seen ? (
              <RiCheckDoubleFill size={14} className="text-brand-500" title="Seen" />
            ) : (
              <RiCheckLine size={14} title="Sent" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
