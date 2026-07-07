import { useCallback, useRef } from 'react';

/**
 * Fires `onLongPress` after the pointer is held for `delay` ms without moving
 * much. Used to open the message action sheet on touch, where the desktop
 * hover menu is unreachable. Cancels on move/scroll so it never fights the
 * list's scrolling.
 */
export default function useLongPress(onLongPress, { delay = 450, moveTolerance = 10 } = {}) {
  const timer = useRef(null);
  const start = useRef({ x: 0, y: 0 });
  const fired = useRef(false);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      // Ignore secondary buttons; only primary touch/mouse.
      if (e.button && e.button !== 0) return;
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!timer.current) return;
      const dx = Math.abs(e.clientX - start.current.x);
      const dy = Math.abs(e.clientY - start.current.y);
      if (dx > moveTolerance || dy > moveTolerance) clear();
    },
    [clear, moveTolerance]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: clear,
    onPointerLeave: clear,
    // Let callers suppress the click that follows a long-press.
    didLongPress: () => fired.current,
  };
}
