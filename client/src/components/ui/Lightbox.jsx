import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

/**
 * Full-screen image preview. Shared by the feed image grid and chat images.
 * `src` null/undefined = closed. Closes on backdrop click or Escape.
 */
export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [src, onClose]);

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4"
        >
          <button
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Close preview"
          >
            <FiX size={22} />
          </button>
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            src={src}
            alt=""
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
