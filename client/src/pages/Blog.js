import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, loadErrorMessage } from '../lib/api';
import { pageTransition, staggerContainer, fadeUpItem } from '../lib/animations';
import { formatDate, formatTags } from '../lib/format';
import FilterButtons from '../components/FilterButtons';

const containerVariants = staggerContainer(0.15);
const itemVariants = fadeUpItem();

function BlogCard({ post }) {
  return (
    <motion.div variants={itemVariants}>
      <Link to={`/blog/${post.slug}`} className="blog-card">
        {post.coverImage && (
          <div className="blog-card-image">
            <img src={post.coverImage} alt={post.title} />
          </div>
        )}
        <div className="blog-card-meta">{formatDate(post.publishedAt)} • {formatTags(post.tags)}</div>
        <h3>{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
      </Link>
    </motion.div>
  );
}

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/blog');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError(loadErrorMessage(err, 'Failed to load blog posts. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const allTags = useMemo(() => [...new Set(posts.flatMap(post => post.tags || []))], [posts]);

  const term = searchTerm.toLowerCase();
  const filteredPosts = posts.filter(post =>
    (post.title.toLowerCase().includes(term) || post.excerpt.toLowerCase().includes(term)) &&
    (!selectedTag || post.tags?.includes(selectedTag))
  );

  const renderPosts = () => {
    if (loading) return <div className="loading">Loading posts...</div>;
    if (error) return <div className="empty-state"><h3>⚠️ {error}</h3></div>;
    if (filteredPosts.length === 0) {
      return (
        <div className="empty-state">
          <h3>No posts found</h3>
          <p>{searchTerm || selectedTag ? 'Try adjusting your filters' : 'Stay tuned for upcoming articles!'}</p>
        </div>
      );
    }
    return (
      <motion.div className="blog-grid" variants={containerVariants} initial="hidden" animate="visible">
        {filteredPosts.map(post => <BlogCard key={post._id} post={post} />)}
      </motion.div>
    );
  };

  return (
    <motion.div className="page" {...pageTransition}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="page-title">Blog</h1>
        <p className="page-subtitle">Exploring the chaos — one messy mind at a time</p>
      </motion.div>

      <div className="blog-filters">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <FilterButtons options={allTags} active={selectedTag} onSelect={setSelectedTag} allValue="" />
      </div>

      {renderPosts()}
    </motion.div>
  );
}

export default Blog;
