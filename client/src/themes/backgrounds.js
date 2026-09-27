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
import SunsetGrid from '../components/backgrounds/SunsetGrid';
import Starfield from '../components/backgrounds/Starfield';
import Waves from '../components/backgrounds/Waves';
import Aurora from '../components/backgrounds/Aurora';
import Paper from '../components/backgrounds/Paper';

export const BACKGROUNDS = [
  {
    id: 'circles',
    name: 'Drifting Circles',
    description: 'Two soft gradient circles slowly drifting in opposite corners.',
    Component: Circles
  },
  {
    id: 'sunset-grid',
    name: 'Sunset Grid',
    description: '80s synthwave: a striped sun on the horizon over a glowing grid floor.',
    Component: SunsetGrid
  },
  {
    id: 'starfield',
    name: 'Starfield',
    description: 'Layers of softly twinkling stars drifting past a faint nebula.',
    Component: Starfield
  },
  {
    id: 'waves',
    name: 'Coastal Waves',
    description: 'Gentle layered waves rolling along the bottom of the screen.',
    Component: Waves
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Northern lights: soft colour bands swaying across the sky.',
    Component: Aurora
  },
  {
    id: 'paper',
    name: 'Paper Grain',
    description: 'Still, printed-paper texture with a faint vignette. No motion.',
    Component: Paper
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
