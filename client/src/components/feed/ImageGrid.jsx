import { useState } from 'react';
import Lightbox from '@/components/ui/Lightbox';
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

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
