import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/blog`);
      setPosts(response.data);
      
      // Extract all unique tags
      const tags = [...new Set(response.data.flatMap(post => post.tags || []))];
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError('Failed to load blog posts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Exploring the chaos - one messy mind at a time</p>
      </motion.div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            border: '2px solid var(--border)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-body)'
          }}
        />
        
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedTag('')}
              style={{
                padding: '0.5rem 1rem',
                border: selectedTag === '' ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: selectedTag === '' ? 'var(--accent)' : 'transparent',
                color: selectedTag === '' ? 'white' : 'var(--text)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                transition: 'all 0.3s'
              }}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '0.5rem 1rem',
                  border: selectedTag === tag ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: selectedTag === tag ? 'var(--accent)' : 'transparent',
                  color: selectedTag === tag ? 'white' : 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  transition: 'all 0.3s'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : error ? (
        <div className="empty-state">
          <h3>⚠️ {error}</h3>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>{searchTerm || selectedTag ? 'Try adjusting your filters' : 'Stay tuned for upcoming articles!'}</p>
        </div>
      ) : (
        <motion.div
          className="blog-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPosts.map((post) => (
            <motion.div key={post._id} variants={itemVariants}>
              <Link to={`/blog/${post.slug}`} className="blog-card">
                {post.coverImage && (
                  <div className="blog-card-image">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                )}
                
                <div className="blog-card-meta">
                  {formatDate(post.publishedAt)} • {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'Uncategorized'}
                </div>
                
                <h3>{post.title}</h3>
                
                <p className="blog-card-excerpt">{post.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default Blog;