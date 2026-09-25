import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api, loadErrorMessage } from '../lib/api';
import { pageTransition, staggerContainer, fadeUpItem } from '../lib/animations';
import FilterButtons from '../components/FilterButtons';

const containerVariants = staggerContainer();
const itemVariants = fadeUpItem(0.5);

const NO_ITEMS = [];

const unique = (values) => [...new Set(values.filter(Boolean))];

const matchesSearch = (item, term) => {
  if (!term) return true;
  const needle = term.toLowerCase();
  return [item.title, item.description, item.category, ...(item.tags || [])]
    .some(value => (value || '').toLowerCase().includes(needle));
};

const inCategory = (item, category) => category === 'all' || item.category === category;
const hasTag = (item, tag) => tag === 'all' || (item.tags || []).includes(tag);

// Category → tag filtering for one section; tags are scoped to the chosen category
function useFilteredCollection(items, searchTerm) {
  const [category, setCategoryState] = useState('all');
  const [tag, setTag] = useState('all');

  const setCategory = (value) => {
    setCategoryState(value);
    setTag('all');
  };

  const categories = useMemo(() => unique(items.map(item => item.category)), [items]);
  const tags = useMemo(
    () => unique(items.filter(item => inCategory(item, category)).flatMap(item => item.tags || [])),
    [items, category]
  );
  const filtered = useMemo(
    () => items.filter(item =>
      matchesSearch(item, searchTerm) && inCategory(item, category) && hasTag(item, tag)
    ),
    [items, searchTerm, category, tag]
  );

  return { categories, category, setCategory, tags, tag, setTag, filtered };
}

function CreativesSection({ title, collection, searchTerm, emptyText, gridClassName, children }) {
  const { categories, category, setCategory, tags, tag, setTag, filtered } = collection;
  return (
    <section className="creatives-section">
      <motion.h2
        className="creatives-section-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {title}
        {searchTerm && <span className="section-count">({filtered.length})</span>}
      </motion.h2>

      <FilterButtons options={categories} active={category} onSelect={setCategory} label="Category" />
      <FilterButtons options={tags} active={tag} onSelect={setTag} label="Tag" />

      {filtered.length === 0 ? (
        <p className="section-no-results">{emptyText}</p>
      ) : (
        <motion.div
          className={gridClassName}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {filtered.map(children)}
        </motion.div>
      )}
    </section>
  );
}

function TagList({ tags, listClassName, tagClassName }) {
  if (!tags?.length) return null;
  return (
    <div className={listClassName}>
      {tags.map((tag, i) => <span key={i} className={tagClassName}>{tag}</span>)}
    </div>
  );
}

function PhotoCard({ photo, flipped, onFlip }) {
  return (
    <motion.div
      className={`photo-flip-card ${flipped ? 'flipped' : ''}`}
      variants={itemVariants}
      onClick={onFlip}
    >
      <div className="photo-flip-inner">
        <div className="photo-flip-front">
          <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
          <div className="photo-flip-hint"><span>Tap to see details</span></div>
        </div>
        <div className="photo-flip-back">
          <h3>{photo.title}</h3>
          {photo.description && <p className="photo-flip-desc">{photo.description}</p>}
          {photo.category && (
            <span className="photo-flip-category">
              {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
            </span>
          )}
          <a
            href={photo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="photo-flip-link"
            onClick={(e) => e.stopPropagation()}
          >
            View Full Image →
          </a>
          <TagList tags={photo.tags} listClassName="photo-flip-tags" tagClassName="photo-flip-tag" />
        </div>
      </div>
    </motion.div>
  );
}

function VideoCard({ video, playing, onPlay }) {
  return (
    <motion.div className="video-card" variants={itemVariants}>
      {playing ? (
        <div className="video-player">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="video-thumbnail" onClick={onPlay}>
          <img
            src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
            alt={video.title}
            loading="lazy"
            onError={(e) => { e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`; }}
          />
          <div className="video-play-btn">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)" />
              <polygon points="19,14 19,34 35,24" fill="white" />
            </svg>
          </div>
        </div>
      )}
      <div className="video-info">
        <h3>{video.title}</h3>
        {video.description && <p>{video.description}</p>}
        <div className="video-meta-row">
          {video.category && <span className="video-category">{video.category}</span>}
          <TagList tags={video.tags} listClassName="video-tags" tagClassName="video-tag" />
        </div>
      </div>
    </motion.div>
  );
}

function OtherCard({ item }) {
  return (
    <motion.div className="others-card" variants={itemVariants} whileHover={{ y: -5 }}>
      {item.imageUrl && (
        <div className="others-card-image">
          <img src={item.imageUrl} alt={item.title} loading="lazy" />
        </div>
      )}
      <div className="others-card-content">
        <h3>{item.title}</h3>
        {item.description && <p>{item.description}</p>}
        {item.category && <span className="others-category">{item.category}</span>}
        {item.linkUrl && (
          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="others-link">View →</a>
        )}
        <TagList tags={item.tags} listClassName="others-tags" tagClassName="others-tag" />
      </div>
    </motion.div>
  );
}

function PageHeader({ subtitle = 'My creative outlet' }) {
  return (
    <>
      <h1 className="page-title">Creatives</h1>
      <p className="page-subtitle">{subtitle}</p>
    </>
  );
}

function Creatives() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [photos, videos, others] = await Promise.all(
          ['photography', 'videos', 'creatives'].map(endpoint => api.get(`/${endpoint}`))
        );
        const featured = (res) => res.data.filter(item => item.featured);
        setData({ photos: featured(photos), videos: featured(videos), others: featured(others) });
      } catch (err) {
        console.error('Error fetching creatives:', err);
        setError(loadErrorMessage(err, 'Failed to load creative works. Please try again later.'));
      }
    };
    fetchAllData();
  }, []);

  const photos = useFilteredCollection(data?.photos ?? NO_ITEMS, searchTerm);
  const videos = useFilteredCollection(data?.videos ?? NO_ITEMS, searchTerm);
  const others = useFilteredCollection(data?.others ?? NO_ITEMS, searchTerm);

  if (error) {
    return (
      <div className="page">
        <PageHeader />
        <div className="empty-state"><h3>⚠️ {error}</h3></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page"><div className="loading">Loading creatives...</div></div>
    );
  }

  if (!data.photos.length && !data.videos.length && !data.others.length) {
    return (
      <motion.div className="page" {...pageTransition}>
        <PageHeader />
        <div className="empty-state">
          <h3>Coming soon</h3>
          <p>Creative works will be showcased here. Stay tuned!</p>
        </div>
      </motion.div>
    );
  }

  // While searching, hide sections with no matches
  const isVisible = (items, collection) => items.length > 0 && (collection.filtered.length > 0 || !searchTerm);
  const totalResults = photos.filtered.length + videos.filtered.length + others.filtered.length;

  return (
    <motion.div className="page" {...pageTransition}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <PageHeader subtitle="My creative outlet — photography, videography, and more" />
      </motion.div>

      <div className="creatives-search">
        <input
          type="text"
          placeholder="Search all creatives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <p className="creatives-search-results">
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
            <button onClick={() => setSearchTerm('')} className="creatives-search-clear">Clear</button>
          </p>
        )}
      </div>

      {searchTerm && totalResults === 0 && (
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try adjusting your search term</p>
        </div>
      )}

      {isVisible(data.photos, photos) && (
        <CreativesSection
          title="Photography"
          collection={photos}
          searchTerm={searchTerm}
          emptyText="No photos match the current filters."
          gridClassName="photo-flip-grid"
        >
          {photo => (
            <PhotoCard
              key={photo._id}
              photo={photo}
              flipped={Boolean(flippedCards[photo._id])}
              onFlip={() => setFlippedCards(prev => ({ ...prev, [photo._id]: !prev[photo._id] }))}
            />
          )}
        </CreativesSection>
      )}

      {isVisible(data.videos, videos) && (
        <CreativesSection
          title="Videography"
          collection={videos}
          searchTerm={searchTerm}
          emptyText="No videos match the current filters."
          gridClassName="video-grid"
        >
          {video => (
            <VideoCard
              key={video._id}
              video={video}
              playing={activeVideo === video._id}
              onPlay={() => setActiveVideo(video._id)}
            />
          )}
        </CreativesSection>
      )}

      {isVisible(data.others, others) && (
        <CreativesSection
          title="Others"
          collection={others}
          searchTerm={searchTerm}
          emptyText="No items match the current filters."
          gridClassName="others-grid"
        >
          {item => <OtherCard key={item._id} item={item} />}
        </CreativesSection>
      )}
    </motion.div>
  );
}

export default Creatives;
