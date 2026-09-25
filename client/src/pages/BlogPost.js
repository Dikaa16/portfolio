import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github-dark.css';
import { API_URL } from '../config';

// =============================================
// Admonition icons
// =============================================
const ADMONITION_ICONS = {
  note: 'ℹ️', info: 'ℹ️',
  tip: '💡', success: '✅', hint: '💡',
  warning: '⚠️', caution: '⚠️', attention: '⚠️',
  danger: '🚨', error: '❌', bug: '🐛',
  example: '📝', abstract: '📋', question: '❓',
  quote: '💬', failure: '❗'
};

const ADMONITION_TYPES = Object.keys(ADMONITION_ICONS);

// =============================================
// Pre-process markdown to convert admonition
// syntax into HTML before passing to marked.
// Supports:
//   :::warning Title Here       !!! warning Title Here
//   Content goes here           Content goes here
//   :::                         !!!
// =============================================
function preprocessAdmonitions(markdown) {
  // Match both ::: and !!! delimiters
  const regex = /^(?::::|!!!) *(\w+)(?: +(.+))?\n([\s\S]*?)(?::::|!!!)\s*$/gm;
  
  return markdown.replace(regex, (match, type, title, body) => {
    const typeLower = type.toLowerCase();
    if (!ADMONITION_TYPES.includes(typeLower)) return match;
    
    const displayTitle = title || typeLower.charAt(0).toUpperCase() + typeLower.slice(1);
    const icon = ADMONITION_ICONS[typeLower] || 'ℹ️';
    
    // Return a placeholder that won't be parsed as markdown structure
    // We use a unique marker that we'll replace after marked processes everything
    const id = Math.random().toString(36).substring(2, 10);
    return `\n<div class="admonition admonition-${typeLower}" data-admonition="${id}"><p class="admonition-title">${icon} ${displayTitle}</p>\n\n${body.trim()}\n\n</div>\n`;
  });
}

// =============================================
// Custom renderer for other elements
// =============================================
const renderer = {
  image(href, title, text) {
    const src = typeof href === 'object' ? href.href : href;
    const altText = typeof href === 'object' ? href.text : text;
    const titleText = typeof href === 'object' ? href.title : title;
    const titleAttr = titleText ? ` title="${titleText}"` : '';
    return `<figure class="blog-figure">
      <img src="${src}" alt="${altText || ''}"${titleAttr} loading="lazy" />
      ${altText ? `<figcaption>${altText}</figcaption>` : ''}
    </figure>`;
  },
  table(header, body) {
    return `<div class="blog-table-wrapper"><table>${header}${body}</table></div>`;
  },
  blockquote(quote) {
    return `<blockquote class="blog-blockquote">${quote}</blockquote>`;
  },
  code(code, language) {
    const codeStr = typeof code === 'object' ? code.text : code;
    const lang = typeof code === 'object' ? code.lang : language;
    
    let highlighted;
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(codeStr, { language: lang }).value;
      } catch (e) {
        highlighted = hljs.highlightAuto(codeStr).value;
      }
    } else {
      try {
        highlighted = hljs.highlightAuto(codeStr).value;
      } catch (e) {
        highlighted = codeStr
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
    }
    
    const langLabel = lang ? `<span class="code-lang-label">${lang}</span>` : '';
    return `<div class="code-block-wrapper">${langLabel}<pre><code class="hljs${lang ? ` language-${lang}` : ''}">${highlighted}</code></pre></div>`;
  }
};

// =============================================
// Create marked instance with all extensions
// =============================================
const marked = new Marked();

marked.use({ renderer });
marked.use(markedFootnote({ refMarkers: true }));

marked.setOptions({
  breaks: true,
  gfm: true,
});

// Embedded video iframes are allowed only from these hosts
const IFRAME_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  try {
    const { protocol, hostname } = new URL(node.getAttribute('src') || '');
    if (protocol === 'https:' && IFRAME_HOSTS.includes(hostname)) return;
  } catch {}
  node.parentNode?.removeChild(node);
});

// Wrapper: preprocess admonitions, parse, then strip scripts/unsafe HTML
function parseMarkdown(content) {
  const preprocessed = preprocessAdmonitions(content);
  return DOMPurify.sanitize(marked.parse(preprocessed), {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['loading', 'allow', 'allowfullscreen', 'frameborder'],
  });
}

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/blog/${slug}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and refresh the page.');
      } else {
        setError('Post not found');
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
          <h2>{error === 'Post not found' ? 'Post not found' : '⚠️ ' + error}</h2>
          <p>{error === 'Post not found' ? "The post you're looking for doesn't exist." : 'Please try again in a moment.'}</p>
          <Link to="/blog" className="btn" style={{ marginTop: '2rem' }}>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="blog-post"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="blog-post-header">
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            {formatDate(post.publishedAt)} • {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'Uncategorized'}
          </div>
        </div>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
        />

        <motion.div
          style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}
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
