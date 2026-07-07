import { useEffect, useRef, useState } from 'react';

/**
 * Returns `true` when a sticky bar should hide (user scrolling down, past
 * `minScroll`) and `false` when it should show again (scrolling up / near top).
 *
 * Reads window scroll through a requestAnimationFrame gate with a passive
 * listener, so it never blocks the scroll thread — key for smooth mobile
 * scrolling. Small deltas are ignored to avoid jitter from momentum scroll.
 */
export default function useHideOnScroll({ threshold = 6, minScroll = 64 } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) > threshold) {
        setHidden(delta > 0 && y > minScroll);
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, minScroll]);

  return hidden;
}
