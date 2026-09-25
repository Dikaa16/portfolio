import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import './App.css';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Creatives from './pages/Creatives';
import Admin from './pages/Admin';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll to override smooth scroll CSS
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function Navigation() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuOpen]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/blog', label: 'Blog' },
    { path: '/creatives', label: 'Creatives' },
    { path: '/admin', label: 'Admin' }
  ];

  return (
    <>
      <motion.nav 
        className="main-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <motion.span
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ASP
          </motion.span>
        </Link>
        
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={location.pathname === item.path || (item.path === '/creatives' && location.pathname.startsWith('/creatives')) ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>

        <button 
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </motion.nav>

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
    </>
  );
}

// Custom ring cursor. Position lives in motion values, so moving the mouse
// animates the ring directly without re-rendering React.
function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const spring = { damping: 25, stiffness: 700, mass: 0.2 };
  const x = useSpring(mouseX, spring);
  const y = useSpring(mouseY, spring);

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

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <CustomCursor />

        <ScrollToTop />
        <Navigation />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/creatives" element={<Creatives />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>

        <footer className="main-footer">
          <motion.div 
            className="footer-content"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p>© 2025 Andika Sentosa Putra. All rights reserved.</p>
            <div className="social-links">
              <a href="https://github.com/AndikaEsPe" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/andika-sentosa-putra-81448b213/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </motion.div>
        </footer>
      </div>
    </Router>
  );
}

export default App;