import React, { useEffect, useState } from 'react';
import { THEMES } from '../../themes/themes';
import { loadFonts } from '../../themes/engine';
import { useTheme } from '../../themes/ThemeContext';
import { actionErrorMessage } from '../../lib/api';

// Miniature of the site drawn with the theme's own palette and fonts
function ThemePreview({ theme }) {
  const { colors, fonts } = theme;
  const radius = theme.tokens?.radius || '8px';
  return (
    <div
      className="theme-preview"
      style={{ background: colors.secondary, color: colors.text, fontFamily: fonts.body }}
      aria-hidden="true"
    >
      <div className="theme-preview-nav" style={{ borderColor: colors.border }}>
        <span style={{ fontFamily: fonts.display, color: colors.primary }}>ASP</span>
        <span className="theme-preview-links" style={{ fontFamily: fonts.mono }}>
          <b style={{ color: colors.accent }}>Home</b> Blog
        </span>
      </div>
      <div className="theme-preview-title" style={{ fontFamily: fonts.display, color: colors.primary }}>
        Andika <span style={{ color: colors.accent }}>Putra</span>
      </div>
      <div className="theme-preview-card" style={{ background: colors.background, borderColor: colors.border, borderRadius: radius }}>
        <span className="theme-preview-line" style={{ background: colors.primary }} />
        <span className="theme-preview-line short" style={{ background: colors['text-light'] }} />
        <span className="theme-preview-chip" style={{ borderColor: colors.accent, color: colors.accent, fontFamily: fonts.mono }}>React</span>
      </div>
    </div>
  );
}

function ThemePicker() {
  const { siteThemeId, activeId, previewId, previewTheme, cancelPreview, saveTheme } = useTheme();
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fonts for every preview card; stop previewing when leaving the picker
  useEffect(() => {
    THEMES.forEach(theme => loadFonts(theme.fonts.href));
    return cancelPreview;
  }, [cancelPreview]);

  const previewing = previewId && previewId !== siteThemeId ? THEMES.find(t => t.id === previewId) : null;

  const select = (id) => {
    setStatus(null);
    if (id === siteThemeId) cancelPreview();
    else previewTheme(id);
  };

  const apply = async () => {
    setSaving(true);
    try {
      await saveTheme(previewId);
      setStatus({ tone: 'success', text: `✅ ${previewing.name} is now live for all visitors.` });
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
        Pick a card to preview it across the whole site (only you see the preview), then apply it for everyone.
      </p>

      {status && <div className={`message ${status.tone}`}>{status.text}</div>}

      {previewing && (
        <div className="theme-apply-bar">
          <span>Previewing <strong>{previewing.name}</strong></span>
          <div className="theme-apply-actions">
            <button type="button" className="btn-cancel" onClick={cancelPreview} disabled={saving}>Cancel</button>
            <button type="button" className="submit-btn" onClick={apply} disabled={saving}>
              {saving ? 'Applying...' : 'Apply to site'}
            </button>
          </div>
        </div>
      )}

      <div className="theme-grid">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            type="button"
            className={`theme-card ${theme.id === activeId ? 'selected' : ''}`}
            onClick={() => select(theme.id)}
            aria-pressed={theme.id === activeId}
          >
            <ThemePreview theme={theme} />
            <div className="theme-card-body">
              <div className="theme-card-heading">
                <h3>{theme.name}</h3>
                {theme.id === siteThemeId && <span className="status-badge published">Live</span>}
              </div>
              <p>{theme.description}</p>
              <div className="theme-swatches">
                {['secondary', 'background', 'primary', 'accent'].map(key => (
                  <span key={key} style={{ background: theme.colors[key] }} />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemePicker;
