import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import './themes/themes.css';
import { ThemeProvider } from './themes/ThemeContext';
import CustomCursor from './components/CustomCursor';
import ScrollToTop from './components/ScrollToTop';
import Navigation from './components/Navigation';
import Background from './components/Background';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Creatives from './pages/Creatives';

// Loaded on demand: markdown rendering and the admin panel are the heaviest parts
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <CustomCursor />

          <ScrollToTop />
          <Navigation />
          <Background />
        
          <Suspense fallback={<div className="page"><div className="loading">Loading...</div></div>}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/creatives" element={<Creatives />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </AnimatePresence>
          </Suspense>

          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;