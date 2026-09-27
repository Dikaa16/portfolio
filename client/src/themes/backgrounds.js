// Background registry. Backgrounds are separate from themes, so any theme can
// use any background; a theme names its default in its `background` field.
// To add a background, append an entry here and style it in backgrounds.css:
//   id           short slug stored in the database (a-z, 0-9, -)
//   name         label in the admin picker
//   description  one line for the admin picker
//   Component    what is drawn behind the page (null for nothing)
// Colours come from the theme (--glow-1, --glow-2, --accent, ...), so a
// background fits whichever theme it is paired with.
import Circles from '../components/backgrounds/Circles';

export const BACKGROUNDS = [
  {
    id: 'circles',
    name: 'Drifting Circles',
    description: 'Two soft gradient circles slowly drifting in opposite corners.',
    Component: Circles
  },
  {
    id: 'none',
    name: 'Plain',
    description: 'No background art, just the theme colour.',
    Component: null
  }
];

// Stored when the site should use the current theme's own default
export const AUTO_BACKGROUND_ID = 'auto';
const FALLBACK_BACKGROUND_ID = 'circles';

export const getBackground = (id) =>
  BACKGROUNDS.find(background => background.id === id) ||
  BACKGROUNDS.find(background => background.id === FALLBACK_BACKGROUND_ID);

// 'auto' (or an unknown id) resolves to the theme's default
export const resolveBackground = (choice, theme) =>
  getBackground(BACKGROUNDS.some(b => b.id === choice) ? choice : theme.background);
