export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// Tags line shown under blog titles
export const formatTags = (tags) => (tags?.length ? tags.join(', ') : 'Uncategorized');
