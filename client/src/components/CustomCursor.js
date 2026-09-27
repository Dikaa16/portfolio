import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Custom ring cursor. Position lives in motion values, so moving the mouse
// animates the ring directly without re-rendering React.
const SPRING = { damping: 25, stiffness: 700, mass: 0.2 };

// Safari can show the system arrow after a click, a scroll or a page change,
// and keeps it until the mouse moves. Briefly switching to an equivalent
// hidden-cursor value (see data-cursor-nudge in App.css) makes it re-apply
// the hidden cursor. It is triggered by clicks (repeated, since navigation and
// smooth scrolling land later), scrolling and content changes under the mouse.
const CLICK_NUDGE_DELAYS_MS = [0, 150, 500, 1000];
const NUDGE_HOLD_MS = 50;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

let nudgePending = false;
const nudgeCursor = () => {
  if (nudgePending) return;
  nudgePending = true;
  const root = document.documentElement;
  root.dataset.cursorNudge = '';
  getComputedStyle(document.body).getPropertyValue('cursor'); // apply the change now
  setTimeout(() => {
    delete root.dataset.cursorNudge;
    nudgePending = false;
  }, NUDGE_HOLD_MS);
};

const nudgeAfterClick = () => {
  CLICK_NUDGE_DELAYS_MS.forEach(delay => setTimeout(nudgeCursor, delay));
};

function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const x = useSpring(mouseX, SPRING);
  const y = useSpring(mouseY, SPRING);

  useEffect(() => {
    const handleMove = (e) => {
      if (e.pointerType !== 'mouse') return; // touch/pen taps shouldn't drag the ring around
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    const listeners = [
      [window, 'pointermove', handleMove, { passive: true }],
      [document.documentElement, 'pointerleave', handleLeave]
    ];
    // Only added/removed elements matter; the ring's own style updates are attribute changes
    const contentObserver = new MutationObserver(nudgeCursor);
    if (window.matchMedia(FINE_POINTER).matches) {
      contentObserver.observe(document.body, { childList: true, subtree: true });
      listeners.push(
        [window, 'pointerdown', nudgeCursor, true],
        [window, 'click', nudgeAfterClick, true],
        [window, 'scroll', nudgeCursor, { capture: true, passive: true }],
        [window, 'popstate', nudgeAfterClick],
        [window, 'hashchange', nudgeAfterClick]
      );
    }

    listeners.forEach(([target, ...args]) => target.addEventListener(...args));
    return () => {
      contentObserver.disconnect();
      listeners.forEach(([target, ...args]) => target.removeEventListener(...args));
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className={`custom-cursor ${visible ? '' : 'cursor-hidden'}`}
      style={{ x, y }}
    />
  );
}

export default CustomCursor;
