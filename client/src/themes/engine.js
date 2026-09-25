// Applies a theme from the registry to the document at runtime

// Every theme derives these from its own palette unless it sets them itself
const DERIVED_TOKENS = {
  'glow-1': 'var(--accent)',
  'glow-2': 'color-mix(in srgb, var(--accent) 35%, var(--secondary))',
  'callout-bg': 'color-mix(in srgb, var(--accent) 8%, var(--surface-raised))',
  'callout-border': 'color-mix(in srgb, var(--accent) 25%, var(--surface-raised))'
};

// Status colours tuned for dark backgrounds
const status = (hue, text) => ({
  bg: `color-mix(in srgb, ${hue} 18%, var(--surface-raised))`,
  border: `color-mix(in srgb, ${hue} 45%, var(--surface-raised))`,
  text
});
const success = status('#22c55e', '#86efac');
const error = status('#ef4444', '#fca5a5');
const warning = status('#f59e0b', '#fcd34d');

const DARK_TOKENS = {
  'shadow-color': 'rgba(0, 0, 0, 0.45)',
  'shadow-soft': 'rgba(0, 0, 0, 0.3)',
  danger: '#f87171',
  'success-bg': success.bg, 'success-text': success.text, 'success-border': success.border,
  'error-bg': error.bg, 'error-text': error.text, 'error-border': error.border,
  'warning-bg': warning.bg, 'warning-text': warning.text, 'warning-border': warning.border
};

export const resolveTokens = (theme) => ({
  ...(theme.mode === 'dark' ? DARK_TOKENS : {}),
  ...DERIVED_TOKENS,
  ...theme.colors,
  'font-display': theme.fonts.display,
  'font-body': theme.fonts.body,
  'font-mono': theme.fonts.mono,
  ...theme.tokens
});

// Adds a Google Fonts stylesheet once; safe to call repeatedly
export const loadFonts = (href) => {
  if (!href || document.querySelector(`link[data-theme-fonts="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.themeFonts = href;
  document.head.appendChild(link);
};

let appliedKeys = [];

export function applyTheme(theme) {
  const root = document.documentElement;
  const tokens = resolveTokens(theme);

  // Clear variables from the previous theme so :root defaults apply again
  appliedKeys.filter(key => !(key in tokens)).forEach(key => root.style.removeProperty(`--${key}`));
  Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
  appliedKeys = Object.keys(tokens);

  root.dataset.theme = theme.id;
  root.dataset.mode = theme.mode;
  root.dataset.pattern = theme.pattern || 'none';
  root.style.colorScheme = theme.mode;

  loadFonts(theme.fonts.href);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.colors.secondary);
}

// Last theme this browser saw, so returning visitors get it on first paint
const CACHE_KEY = 'siteTheme';

export const cachedThemeId = () => {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
};

export const cacheThemeId = (id) => {
  try {
    localStorage.setItem(CACHE_KEY, id);
  } catch {
    // Storage unavailable (private mode); the theme still applies for this visit
  }
};
