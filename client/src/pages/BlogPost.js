import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';
import { api, loadErrorMessage } from '../lib/api';
import { pageTransition } from '../lib/animations';
import { formatDate, formatTags } from '../lib/format';
import { parseMarkdown } from '../lib/markdown';

const NOT_FOUND = 'Post not found';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/blog/${slug}`);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(loadErrorMessage(err, NOT_FOUND));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const html = useMemo(() => (post ? parseMarkdown(post.content) : ''), [post]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page">
        <div className="error">
          <h2>{error === NOT_FOUND ? NOT_FOUND : '⚠️ ' + error}</h2>
          <p>{error === NOT_FOUND ? "The post you're looking for doesn't exist." : 'Please try again in a moment.'}</p>
          <Link to="/blog" className="btn error-back-link">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="page" {...pageTransition}>
      <motion.div
        className="blog-post"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="blog-post-header">
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            {formatDate(post.publishedAt)} • {formatTags(post.tags)}
          </div>
        </div>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <motion.div
          className="blog-post-footer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/blog" className="btn">← Back to Blog</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default BlogPost;
