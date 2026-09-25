import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Custom ring cursor. Position lives in motion values, so moving the mouse
// animates the ring directly without re-rendering React.
const SPRING = { damping: 25, stiffness: 700, mass: 0.2 };

// Safari can show the system arrow after a click that navigates or scrolls,
// and keeps it until the mouse moves. Briefly switching to an equivalent
// hidden-cursor value (see data-cursor-nudge in App.css) makes it re-apply
// the hidden cursor. Repeated because the navigation/scroll may land later.
const NUDGE_DELAYS_MS = [0, 150, 500, 1000];

const NUDGE_HOLD_MS = 50;

const nudgeCursor = () => {
  const root = document.documentElement;
  NUDGE_DELAYS_MS.forEach(delay => setTimeout(() => {
    root.dataset.cursorNudge = '';
    getComputedStyle(document.body).getPropertyValue('cursor'); // apply the change now
    setTimeout(() => delete root.dataset.cursorNudge, NUDGE_HOLD_MS);
  }, delay));
};

function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const x = useSpring(mouseX, SPRING);
  const y = useSpring(mouseY, SPRING);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    window.addEventListener('click', nudgeCursor, true);
    window.addEventListener('popstate', nudgeCursor);
    window.addEventListener('hashchange', nudgeCursor);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('click', nudgeCursor, true);
      window.removeEventListener('popstate', nudgeCursor);
      window.removeEventListener('hashchange', nudgeCursor);
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
