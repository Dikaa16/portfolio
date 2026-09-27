// Theme registry. To add a theme, append an object to THEMES:
//   id          short slug stored in the database (a-z, 0-9, -)
//   mode        'light' | 'dark' (dark themes get dark-safe status and callout colours)
//   pattern     'none' | 'grid' | 'dots' texture on the page itself
//   background  default background art (an id from backgrounds.js); the admin can override it
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
    background: 'circles',
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
    // Bright gold fills (with charcoal text); deeper golds keep gold text readable
    tokens: {
      'accent-text': '#8a6b16',
      'accent-display': '#a8841f',
      'on-accent': '#1a1a1a',
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
    background: 'circles',
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
      'glow-opacity': '0.14',
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
    background: 'circles',
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
    background: 'circles',
    colors: {
      primary: '#2b1b16',
      secondary: '#fdf7f2',
      background: '#fbefe6',
      'surface-raised': '#fffaf6',
      text: '#3e2c25',
      'text-light': '#7a5d52',
      border: '#efdccf',
      accent: '#ab432b'
    },
    fonts: {
      display: "'DM Serif Display', serif",
      body: "'DM Sans', sans-serif",
      mono: "'DM Mono', monospace",
      href: googleFonts('DM+Serif+Display', 'DM+Sans:wght@400;500;700', 'DM+Mono:wght@400;500')
    },
    tokens: {
      'glow-1': '#f2a65a',
      'glow-2': '#ab432b',
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
    background: 'circles',
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
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    description: '80s retro: purple dusk, hot pink neon, a chrome script and a sunset over the grid.',
    mode: 'dark',
    pattern: 'none',
    background: 'sunset-grid',
    colors: {
      primary: '#fff1fb',
      secondary: '#12071f',
      background: '#1a0b2e',
      'surface-raised': '#210f3a',
      text: '#e9dcf7',
      'text-light': '#b7a3d6',
      border: '#3b2266',
      accent: '#ff4fa3'
    },
    fonts: {
      display: "'Audiowide', sans-serif",
      body: "'Outfit', sans-serif",
      mono: "'Share Tech Mono', monospace",
      href: googleFonts('Audiowide', 'Mr+Dafoe', 'Outfit:wght@400;500;700', 'Share+Tech+Mono')
    },
    tokens: {
      'on-accent': '#1a0612',
      'glow-1': '#ffb347',
      'glow-2': '#ff3cac',
      'glow-opacity': '0.16',
      'heading-glow': '0 0 18px rgba(255, 79, 163, 0.55)',
      'display-scale': '0.85',
      radius: '6px',
      'code-bg': '#0c0416',
      'code-border': '#3b2266',
      'nav-bg': 'color-mix(in srgb, var(--secondary) 82%, transparent)'
    }
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Arctic night: a deep teal-black sky lit by mint and violet northern lights.',
    mode: 'dark',
    pattern: 'none',
    background: 'aurora',
    colors: {
      primary: '#effffb',
      secondary: '#06131a',
      background: '#0a1c24',
      'surface-raised': '#0e2530',
      text: '#cfe6e2',
      'text-light': '#8fb3ae',
      border: '#1a3844',
      accent: '#5eead4'
    },
    fonts: {
      display: "'Syne', sans-serif",
      body: "'Manrope', sans-serif",
      mono: "'JetBrains Mono', monospace",
      href: googleFonts('Syne:wght@600;700;800', 'Manrope:wght@400;500;700', 'JetBrains+Mono:wght@400;500;700')
    },
    tokens: {
      'on-accent': '#04201b',
      'glow-1': '#34d399',
      'glow-2': '#a78bfa',
      'glow-opacity': '0.12',
      radius: '12px'
    }
  },
  {
    id: 'coastal',
    name: 'Coastal Breeze',
    description: 'Seaside light: sea-glass blues, sandy white and an easy-going serif.',
    mode: 'light',
    pattern: 'none',
    background: 'waves',
    colors: {
      primary: '#0f2d3d',
      secondary: '#f7fbfc',
      background: '#edf5f7',
      'surface-raised': '#ffffff',
      text: '#27414d',
      'text-light': '#51697a',
      border: '#d3e4ea',
      accent: '#0e7490'
    },
    fonts: {
      display: "'Fraunces', serif",
      body: "'Karla', sans-serif",
      mono: "'IBM Plex Mono', monospace",
      href: googleFonts('Fraunces:opsz,wght@9..144,600;9..144,700', 'Karla:wght@400;500;700', 'IBM+Plex+Mono:wght@400;500')
    },
    tokens: {
      'glow-1': '#38bdf8',
      'glow-2': '#0e7490',
      'glow-opacity': '0.1',
      radius: '16px'
    }
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Cosmic night: a near-black void, periwinkle starlight and a hint of nebula pink.',
    mode: 'dark',
    pattern: 'none',
    background: 'starfield',
    colors: {
      primary: '#f2f4ff',
      secondary: '#05060b',
      background: '#0a0c14',
      'surface-raised': '#10131e',
      text: '#d3d8ea',
      'text-light': '#8f97b3',
      border: '#1d2233',
      accent: '#9db4ff'
    },
    fonts: {
      display: "'Unbounded', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'Space Mono', monospace",
      href: googleFonts('Unbounded:wght@500;700', 'Inter:wght@400;600;700', 'Space+Mono:wght@400;700')
    },
    tokens: {
      'on-accent': '#070a18',
      'glow-1': '#9db4ff',
      'glow-2': '#f0abfc',
      'glow-opacity': '0.1',
      'display-scale': '0.82',
      radius: '10px'
    }
  },
  {
    id: 'paper-ink',
    name: 'Paper & Ink',
    description: 'Printed editorial: newsprint off-white, black ink and a single red stamp.',
    mode: 'light',
    pattern: 'none',
    background: 'paper',
    colors: {
      primary: '#111111',
      secondary: '#f4f1ea',
      background: '#ece8de',
      'surface-raised': '#faf8f3',
      text: '#262421',
      'text-light': '#5e5a53',
      border: '#d6d0c2',
      accent: '#b3261e'
    },
    fonts: {
      display: "'Newsreader', serif",
      body: "'Source Serif 4', serif",
      mono: "'IBM Plex Mono', monospace",
      href: googleFonts('Newsreader:opsz,wght@6..72,500;6..72,700', 'Source+Serif+4:opsz,wght@8..60,400;8..60,600', 'IBM+Plex+Mono:wght@400;500')
    },
    tokens: {
      'glow-1': '#b3261e',
      'glow-2': '#111111',
      'glow-opacity': '0.06',
      radius: '0px'
    }
  }
];

export const DEFAULT_THEME_ID = 'classic';

export const getTheme = (id) =>
  THEMES.find(theme => theme.id === id) || THEMES.find(theme => theme.id === DEFAULT_THEME_ID);
