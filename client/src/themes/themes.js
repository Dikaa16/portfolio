// Theme registry. To add a theme, append an object to THEMES:
//   id          short slug stored in the database (a-z, 0-9, -)
//   mode        'light' | 'dark' (dark themes get dark-safe status and callout colours)
//   pattern     'none' | 'grid' | 'dots' background pattern
//   colors      the core palette, used for both the site and the admin preview card
//   fonts       display/body/mono stacks + Google Fonts URL (null if already in index.html)
//   tokens      optional overrides for any other CSS variable in App.css :root
// Theme-specific CSS beyond variables goes in themes.css under html[data-theme="<id>"].

const googleFonts = (...families) =>
  `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`;

export const THEMES = [
  {
    id: 'classic',
    name: 'Classic Gold',
    description: 'The original look: crisp white, charcoal type and a touch of gold.',
    mode: 'light',
    pattern: 'none',
    colors: {
      primary: '#1a1a1a',
      secondary: '#ffffff',
      background: '#fafafa',
      'surface-raised': '#ffffff',
      text: '#333333',
      'text-light': '#666666',
      border: '#e0e0e0',
      accent: '#d4af37'
    },
    fonts: {
      display: "'Playfair Display', serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
      href: null
    },
    // Exact original values (other themes derive these from their accent)
    tokens: {
      'glow-2': '#f4e4b3',
      'callout-bg': '#fffbea',
      'callout-border': '#f0e5c7'
    }
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    description: 'Dark techno: midnight navy, electric cyan, magenta glow and a blueprint grid.',
    mode: 'dark',
    pattern: 'grid',
    colors: {
      primary: '#eaf6ff',
      secondary: '#05070d',
      background: '#0b0f19',
      'surface-raised': '#0f1522',
      text: '#c3cede',
      'text-light': '#8593ad',
      border: '#1b2436',
      accent: '#00e5ff'
    },
    fonts: {
      display: "'Orbitron', sans-serif",
      body: "'Space Grotesk', sans-serif",
      mono: "'JetBrains Mono', monospace",
      href: googleFonts('Orbitron:wght@500;700;900', 'Space+Grotesk:wght@400;500;700', 'JetBrains+Mono:wght@400;500;700')
    },
    tokens: {
      'on-accent': '#031017',
      'glow-1': '#00e5ff',
      'glow-2': '#ff2bd6',
      'glow-opacity': '0.18',
      'grid-line': 'rgba(0, 229, 255, 0.07)',
      'heading-glow': '0 0 24px rgba(0, 229, 255, 0.45)',
      'display-scale': '0.78',
      radius: '2px',
      'code-bg': '#03050a',
      'code-border': '#1b2436',
      'nav-bg': 'color-mix(in srgb, var(--secondary) 80%, transparent)'
    }
  },
  {
    id: 'sage',
    name: 'Sage & Linen',
    description: 'Botanical calm: linen paper, sage green and graceful serif type.',
    mode: 'light',
    pattern: 'dots',
    colors: {
      primary: '#1f2a24',
      secondary: '#f6f3ec',
      background: '#fbf9f4',
      'surface-raised': '#ffffff',
      text: '#34403a',
      'text-light': '#646e67',
      border: '#e3ddd0',
      accent: '#4b7157'
    },
    fonts: {
      display: "'Cormorant Garamond', serif",
      body: "'Nunito Sans', sans-serif",
      mono: "'IBM Plex Mono', monospace",
      href: googleFonts('Cormorant+Garamond:wght@500;600;700', 'Nunito+Sans:wght@400;600;700', 'IBM+Plex+Mono:wght@400;500')
    },
    tokens: {
      'grid-line': 'rgba(75, 113, 87, 0.12)',
      'glow-2': '#dfe8d8',
      'display-scale': '1.12',
      radius: '14px'
    }
  },
  {
    id: 'terracotta',
    name: 'Terracotta Sunset',
    description: 'Warm and editorial: sun-baked clay, blush sand and bold serif headlines.',
    mode: 'light',
    pattern: 'none',
    colors: {
      primary: '#2b1b16',
      secondary: '#fdf7f2',
      background: '#fbefe6',
      'surface-raised': '#fffaf6',
      text: '#3e2c25',
      'text-light': '#7a5d52',
      border: '#efdccf',
      accent: '#b8492f'
    },
    fonts: {
      display: "'DM Serif Display', serif",
      body: "'DM Sans', sans-serif",
      mono: "'DM Mono', monospace",
      href: googleFonts('DM+Serif+Display', 'DM+Sans:wght@400;500;700', 'DM+Mono:wght@400;500')
    },
    tokens: {
      'glow-1': '#f2a65a',
      'glow-2': '#b8492f',
      'glow-opacity': '0.1',
      radius: '4px'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Velvet',
    description: 'Evening elegance: deep plum velvet with rose-gold accents.',
    mode: 'dark',
    pattern: 'none',
    colors: {
      primary: '#f6efff',
      secondary: '#121019',
      background: '#1a1724',
      'surface-raised': '#1f1b2b',
      text: '#d8d2e6',
      'text-light': '#9a92b1',
      border: '#2c2740',
      accent: '#e3b58f'
    },
    fonts: {
      display: "'Bodoni Moda', serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
      href: googleFonts('Bodoni+Moda:wght@500;700;800', 'Inter:wght@400;600;700', 'JetBrains+Mono:wght@400;500;700')
    },
    tokens: {
      'on-accent': '#1a1216',
      'glow-1': '#e3b58f',
      'glow-2': '#8e6bbf',
      'glow-opacity': '0.12',
      radius: '10px'
    }
  }
];

export const DEFAULT_THEME_ID = 'classic';

export const getTheme = (id) =>
  THEMES.find(theme => theme.id === id) || THEMES.find(theme => theme.id === DEFAULT_THEME_ID);
