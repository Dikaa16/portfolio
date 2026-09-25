import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Custom ring cursor. Position lives in motion values, so moving the mouse
// animates the ring directly without re-rendering React.
const SPRING = { damping: 25, stiffness: 700, mass: 0.2 };

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
    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
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
