// Maps a technology name to its icon in public/assets/icons
export const techIconUrl = (tech) => {
  if (tech === 'C#') return '/assets/icons/csharp.svg';
  return `/assets/icons/${tech.toLowerCase().replace(/[.\s]/g, '')}.svg`;
};
