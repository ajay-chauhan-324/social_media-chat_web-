import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const GROUPS = {
  Smileys: ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🤩', '🥳', '😅', '😉', '🙂', '🤔', '😴', '😭', '😡', '🥺', '😇', '🤗'],
  Gestures: ['👍', '👎', '👏', '🙌', '🙏', '👌', '✌️', '🤞', '💪', '👋', '🤝', '🫶', '✋', '🤟', '👊', '🤙'],
  Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '💓', '💕', '💔', '❣️'],
  Fun: ['🔥', '✨', '🎉', '🎊', '⭐', '🌟', '💯', '🚀', '🎯', '🏆', '💡', '📸', '🎨', '🎸', '☕', '🍕'],
};

export default function EmojiPicker({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute bottom-14 left-0 z-30 max-h-72 w-72 overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-soft"
    >
      {Object.entries(GROUPS).map(([group, emojis]) => (
        <div key={group} className="mb-2">
          <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
          <div className="grid grid-cols-8 gap-0.5">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onPick(e)}
                className="grid h-8 w-8 place-items-center rounded-lg text-lg transition hover:bg-surface-2"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
