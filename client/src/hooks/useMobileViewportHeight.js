import { useEffect, useState } from 'react';

/**
 * Tracks the *visual* viewport height on mobile so a full-screen chat can size
 * itself to the space actually available above the on-screen keyboard.
 *
 * - Returns a pixel height on mobile (< lg), or `null` on desktop / when the
 *   VisualViewport API is unavailable (caller falls back to a CSS `dvh` class).
 * - The VisualViewport API shrinks when the keyboard opens on both iOS and
 *   Android, so binding the chat height to it keeps the composer visible and
 *   the header fixed — no layout is pushed off-screen.
 */
export default function useMobileViewportHeight() {
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const vv = window.visualViewport;
    const mq = window.matchMedia('(max-width: 1023px)');

    const update = () => {
      if (mq.matches && vv) setHeight(Math.round(vv.height));
      else setHeight(null);
    };

    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    mq.addEventListener('change', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      mq.removeEventListener('change', update);
    };
  }, []);

  return height;
}
