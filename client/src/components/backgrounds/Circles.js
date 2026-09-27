import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Two slowly drifting gradient circles in opposite corners
function Circles() {
  const still = useReducedMotion();
  return (
    <>
      <motion.div
        className="bg-circle bg-circle-1"
        animate={still ? undefined : { scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="bg-circle bg-circle-2"
        animate={still ? undefined : { scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

export default Circles;
