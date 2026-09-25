import React from 'react';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="main-footer">
      <motion.div 
        className="footer-content"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <p>© {new Date().getFullYear()} Andika Sentosa Putra. All rights reserved.</p>
        <div className="social-links">
          <a href="https://github.com/AndikaEsPe" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/andika-sentosa-putra-81448b213/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;
