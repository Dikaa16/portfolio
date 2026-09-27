import React, { useEffect, useState } from 'react';
import { THEMES, getTheme } from '../../themes/themes';
import { BACKGROUNDS, AUTO_BACKGROUND_ID, getBackground } from '../../themes/backgrounds';
import Background from '../../components/Background';
import { loadFonts } from '../../themes/engine';
import { useTheme } from '../../themes/ThemeContext';
import { actionErrorMessage } from '../../lib/api';

// Miniature of the site drawn with the theme's own palette and fonts
function ThemePreview({ theme }) {
  const { colors, fonts } = theme;
  const radius = theme.tokens?.radius || '8px';
  const accentText = theme.tokens?.['accent-text'] || colors.accent;
  const accentDisplay = theme.tokens?.['accent-display'] || accentText;
  return (
    <div
      className="theme-preview"
      style={{ background: colors.secondary, color: colors.text, fontFamily: fonts.body }}
      aria-hidden="true"
    >
      <div className="theme-preview-nav" style={{ borderColor: colors.border }}>
        <span style={{ fontFamily: fonts.display, color: colors.primary }}>ASP</span>
        <span className="theme-preview-links" style={{ fontFamily: fonts.mono }}>
          <b style={{ color: accentText }}>Home</b> Blog
        </span>
      </div>
      <div className="theme-preview-title" style={{ fontFamily: fonts.display, color: colors.primary }}>
        Andika <span style={{ color: accentDisplay }}>Putra</span>
      </div>
      <div className="theme-preview-card" style={{ background: colors.background, borderColor: colors.border, borderRadius: radius }}>
        <span className="theme-preview-line" style={{ background: colors.primary }} />
        <span className="theme-preview-line short" style={{ background: colors['text-light'] }} />
        <span className="theme-preview-chip" style={{ borderColor: accentText, color: accentText, fontFamily: fonts.mono }}>React</span>
      </div>
    </div>
  );
}

// Selectable card shared by the theme and background grids
function ChoiceCard({ selected, live, title, description, onSelect, art, children }) {
  return (
    <button
      type="button"
      className={`theme-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {art}
      <div className="theme-card-body">
        <div className="theme-card-heading">
          <h3>{title}</h3>
          {live && <span className="status-badge published">Live</span>}
        </div>
        <p>{description}</p>
        {children}
      </div>
    </button>
  );
}

// Background art drawn in the colours of the theme currently shown
const BackgroundArt = ({ background }) => (
  <div className="background-preview" aria-hidden="true">
    <Background background={background} thumbnail />
  </div>
);

function ThemePicker() {
  const { site, preview, active, theme, previewSettings, cancelPreview, savePreview } = useTheme();
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fonts for every preview card; stop previewing when leaving the picker
  useEffect(() => {
    THEMES.forEach(t => loadFonts(t.fonts.href));
    return cancelPreview;
  }, [cancelPreview]);

  const themeDefault = getBackground(theme.background);
  const backgroundName = (id) => (id === AUTO_BACKGROUND_ID ? `Theme default (${themeDefault.name})` : getBackground(id).name);
  const previewParts = [
    preview.theme && `${getTheme(preview.theme).name} theme`,
    preview.background && `${backgroundName(preview.background)} background`
  ].filter(Boolean);

  const backgroundChoices = [
    {
      id: AUTO_BACKGROUND_ID,
      name: 'Theme default',
      description: `Uses ${themeDefault.name}, the background this theme was designed with.`,
      art: themeDefault
    },
    ...BACKGROUNDS
  ];

  const select = (changes) => {
    setStatus(null);
    previewSettings(changes);
  };

  const apply = async () => {
    setSaving(true);
    try {
      await savePreview();
      setStatus({ tone: 'success', text: `✅ ${previewParts.join(' and ')} now live for all visitors.` });
    } catch (error) {
      setStatus({ tone: 'error', text: `❌ Error: ${actionErrorMessage(error)}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-picker">
      <h2>Site Theme</h2>
      <p className="admin-intro">
        Pick a theme and a background to preview them across the whole site (only you see the preview), then apply them for everyone.
      </p>

      {status && <div className={`message ${status.tone}`}>{status.text}</div>}

      {previewParts.length > 0 && (
        <div className="theme-apply-bar">
          <span>Previewing <strong>{previewParts.join(' + ')}</strong></span>
          <div className="theme-apply-actions">
            <button type="button" className="btn-cancel" onClick={cancelPreview} disabled={saving}>Cancel</button>
            <button type="button" className="submit-btn" onClick={apply} disabled={saving}>
              {saving ? 'Applying...' : 'Apply to site'}
            </button>
          </div>
        </div>
      )}

      <div className="theme-grid">
        {THEMES.map(t => (
          <ChoiceCard
            key={t.id}
            selected={t.id === active.theme}
            live={t.id === site.theme}
            title={t.name}
            description={t.description}
            onSelect={() => select({ theme: t.id })}
            art={<ThemePreview theme={t} />}
          >
            <div className="theme-swatches">
              {['secondary', 'background', 'primary', 'accent'].map(key => (
                <span key={key} style={{ background: t.colors[key] }} />
              ))}
            </div>
          </ChoiceCard>
        ))}
      </div>

      <h2 className="picker-section-title">Background</h2>
      <p className="admin-intro">
        Drawn behind every page in the colours of the theme above. Theme default follows whichever theme is live.
      </p>

      <div className="theme-grid">
        {backgroundChoices.map(b => (
          <ChoiceCard
            key={b.id}
            selected={b.id === active.background}
            live={b.id === site.background}
            title={b.name}
            description={b.description}
            onSelect={() => select({ background: b.id })}
            art={<BackgroundArt background={b.art || b} />}
          />
        ))}
      </div>
    </div>
  );
}

export default ThemePicker;
