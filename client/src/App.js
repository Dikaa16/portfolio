import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import CustomCursor from './components/CustomCursor';
import ScrollToTop from './components/ScrollToTop';
import Navigation from './components/Navigation';
import Background from './components/Background';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Creatives from './pages/Creatives';
import Admin from './pages/Admin';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <CustomCursor />

        <ScrollToTop />
        <Navigation />
        <Background />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/creatives" element={<Creatives />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>

        <Footer />
      </div>
    </Router>
  );
}

export default App;