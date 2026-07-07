import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { resolveMedia } from '@/lib/format';

const LAYOUTS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2',
  4: 'grid-cols-2',
};

export default function ImageGrid({ images = [] }) {
  const [lightbox, setLightbox] = useState(null);
  if (!images.length) return null;

  return (
    <>
      <div
        className={cn(
          'mt-3 grid gap-1 overflow-hidden rounded-2xl border border-line',
          LAYOUTS[Math.min(images.length, 4)]
        )}
      >
        {images.slice(0, 4).map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(resolveMedia(img.url))}
            className={cn(
              'relative overflow-hidden bg-surface-2',
              images.length === 3 && i === 0 && 'row-span-2'
            )}
          >
            <img
              src={resolveMedia(img.url)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full max-h-[520px] w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4"
            >
              <button
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
                aria-label="Close"
              >
                <FiX size={22} />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={lightbox}
                alt=""
                className="max-h-[90vh] max-w-full rounded-xl object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
