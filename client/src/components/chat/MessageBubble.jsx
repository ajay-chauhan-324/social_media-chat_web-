import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { FiMoreVertical, FiEdit2, FiTrash2, FiCornerUpLeft, FiCheck } from 'react-icons/fi';
import { RiPushpin2Fill, RiCheckDoubleFill, RiCheckLine } from 'react-icons/ri';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Lightbox from '@/components/ui/Lightbox';
import useLongPress from '@/hooks/useLongPress';
import { resolveMedia, timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';
import {
  useEditMessage,
  useDeleteMessage,
  usePinMessage,
  useReactMessage,
} from '@/features/chat/useChat';

const SWIPE_TRIGGER = 56; // px to drag before a reply fires
const QUICK_REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏'];

/** Desktop hover dropdown — driven by the same action list as the mobile sheet. */
function BubbleMenu({ isMine, actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
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
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface-2',
                a.danger ? 'text-danger' : 'text-content'
              )}
            >
              <a.icon size={14} /> {a.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function MessageBubble({ message, isMine, isGroup, showAvatar, seen, onReply, myId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const edit = useEditMessage();
  const del = useDeleteMessage();
  const pin = usePinMessage();
  const react = useReactMessage();

  const deleted = message.isDeleted;
  const toggleReaction = (emoji) => react.mutate({ id: message._id, emoji });

  // Group reactions by emoji for compact pills, flagging the caller's own.
  const reactionList = Object.values(
    (message.reactions || []).reduce((acc, r) => {
      acc[r.emoji] ??= { emoji: r.emoji, count: 0, mine: false };
      acc[r.emoji].count += 1;
      if (String(r.user?._id || r.user) === String(myId)) acc[r.emoji].mine = true;
      return acc;
    }, {})
  );

  const startEdit = () => {
    setDraft(message.content);
    setEditing(true);
  };

  const saveEdit = () => {
    const text = draft.trim();
    if (text && text !== message.content) edit.mutate({ id: message._id, content: text });
    setEditing(false);
  };

  // One action list, rendered by both the desktop dropdown and the mobile sheet.
  const actions = [
    { icon: FiCornerUpLeft, label: 'Reply', onClick: () => onReply(message) },
    {
      icon: RiPushpin2Fill,
      label: message.isPinned ? 'Unpin' : 'Pin',
      onClick: () => pin.mutate(message._id),
    },
    ...(isMine && message.type === 'text'
      ? [{ icon: FiEdit2, label: 'Edit', onClick: startEdit }]
      : []),
    ...(isMine
      ? [{ icon: FiTrash2, label: 'Delete', danger: true, onClick: () => del.mutate(message._id) }]
      : []),
  ];

  // Long-press (touch) opens the action sheet; a following click is swallowed.
  const longPress = useLongPress(() => !deleted && setSheetOpen(true));

  return (
    <div className={cn('group flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {isGroup && !isMine && (
        <div className="w-8 shrink-0">
          {showAvatar && <Avatar src={message.sender.avatar} name={message.sender.name} size="xs" />}
        </div>
      )}

      <div className={cn('relative flex max-w-[75%] flex-col', isMine ? 'items-end' : 'items-start')}>
        {isGroup && !isMine && showAvatar && (
          <span className="mb-0.5 px-1 text-xs font-semibold text-brand-600">{message.sender.name}</span>
        )}

        {/* Reply affordance revealed while swiping */}
        <span
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted',
            isMine ? '-right-8' : '-left-8'
          )}
        >
          <FiCornerUpLeft size={16} />
        </span>

        <div className={cn('flex items-center gap-1', isMine && 'flex-row-reverse')}>
          <motion.div
            drag={editing || deleted ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            dragSnapToOrigin
            onDragEnd={(_e, info) => {
              if (Math.abs(info.offset.x) > SWIPE_TRIGGER) onReply(message);
            }}
            {...longPress}
            onClickCapture={(e) => {
              // Swallow the click that a long-press would otherwise trigger.
              if (longPress.didLongPress()) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className={cn(
              'relative touch-pan-y rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed',
              isMine ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-surface-2 text-content'
            )}
          >
            {message.isPinned && (
              <RiPushpin2Fill
                className={cn('absolute -top-2', isMine ? '-left-2 text-brand-400' : '-right-2 text-brand-600')}
                size={13}
              />
            )}

            {/* Reply preview */}
            {message.replyTo && !deleted && (
              <div
                className={cn(
                  'mb-1 rounded-lg border-l-2 px-2 py-1 text-xs',
                  isMine ? 'border-white/50 bg-white/10' : 'border-brand-500 bg-surface'
                )}
              >
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit();
                    }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  className="min-w-[160px] resize-none rounded-lg bg-white/20 px-2 py-1 text-white outline-none placeholder:text-white/60"
                />
                <button onClick={saveEdit} className="rounded-full bg-white/25 p-1">
                  <FiCheck size={14} />
                </button>
              </div>
            ) : (
              <>
                {message.images?.length > 0 && (
                  <div
                    className={cn(
                      'grid gap-1',
                      message.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
                      message.content && 'mb-1.5'
                    )}
                  >
                    {message.images.map((img, i) => (
                      <img
                        key={i}
                        src={resolveMedia(img.url)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onClick={() => setPreview(resolveMedia(img.url))}
                        className="max-h-60 cursor-pointer rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
                {message.content && (
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</p>
                )}
              </>
            )}
          </motion.div>

          {!deleted && <BubbleMenu isMine={isMine} actions={actions} />}
        </div>

        {reactionList.length > 0 && (
          <div className={cn('mt-1 flex flex-wrap gap-1', isMine && 'justify-end')}>
            {reactionList.map((r) => (
              <button
                key={r.emoji}
                onClick={() => toggleReaction(r.emoji)}
                aria-label={`${r.emoji} reaction${r.mine ? ', tap to remove' : ''}`}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs leading-none transition active:scale-90',
                  r.mine
                    ? 'border-brand-500 bg-brand-600/10 text-content'
                    : 'border-line bg-surface text-muted hover:bg-surface-2'
                )}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="tabular-nums">{r.count}</span>}
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            'mt-0.5 flex items-center gap-1 px-1 text-[11px] text-muted',
            isMine && 'flex-row-reverse'
          )}
        >
          <span>{timeAgo(message.createdAt)}</span>
          {message.editedAt && !deleted && <span>· edited</span>}
          {isMine &&
            !deleted &&
            (seen ? (
              <RiCheckDoubleFill size={14} className="text-brand-500" title="Seen" />
            ) : (
              <RiCheckLine size={14} title="Sent" />
            ))}
        </div>
      </div>

      {/* Mobile long-press action sheet */}
      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} size="sm">
        <div className="mb-1 flex items-center justify-around">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setSheetOpen(false);
                toggleReaction(emoji);
              }}
              aria-label={`React ${emoji}`}
              className="grid h-11 w-11 place-items-center rounded-full text-2xl transition hover:bg-surface-2 active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="my-1 border-t border-line" />
        <div className="flex flex-col">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setSheetOpen(false);
                a.onClick();
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] transition hover:bg-surface-2',
                a.danger ? 'text-danger' : 'text-content'
              )}
            >
              <a.icon size={18} /> {a.label}
            </button>
          ))}
        </div>
      </Modal>

      <Lightbox src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

// Memoized: only the changed/new bubble re-renders when a message arrives
// (React Query structural sharing keeps prior message objects stable, and
// onReply is a stable setState from ChatWindow).
export default memo(MessageBubble);
