import React from 'react';
import { motion } from 'framer-motion';

// Slowly drifting decorative circles behind all pages
function Background() {
  return (
    <div className="bg-elements">
      <motion.div 
        className="bg-circle bg-circle-1"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="bg-circle bg-circle-2"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

export default Background;
