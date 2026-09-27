import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, authHeaders } from '../lib/api';
import { DEFAULT_THEME_ID, getTheme } from './themes';
import { AUTO_BACKGROUND_ID, resolveBackground } from './backgrounds';
import { applyTheme, cachedSetting, cacheSettings } from './engine';

const ThemeContext = createContext(null);

const initialSettings = () => ({
  theme: cachedSetting('theme') || DEFAULT_THEME_ID,
  background: cachedSetting('background') || AUTO_BACKGROUND_ID
});

// site:    { theme, background } every visitor sees (stored in the API)
// preview: the parts the admin is trying out; only this browser sees them
export function ThemeProvider({ children }) {
  const [site, setSite] = useState(initialSettings);
  const [preview, setPreview] = useState({});

  const updateSite = useCallback((settings) => {
    setSite(settings);
    cacheSettings(settings);
  }, []);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => updateSite(data))
      .catch(error => console.error('Could not load site settings:', error));
  }, [updateSite]);

  const active = { ...site, ...preview };
  const theme = getTheme(active.theme);
  const background = resolveBackground(active.background, theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.background = background.id;
  }, [background]);

  // Previewing the live value again drops that part of the preview
  const previewSettings = useCallback((changes) => {
    setPreview(current => {
      const next = { ...current, ...changes };
      Object.keys(next).forEach(name => { if (next[name] === site[name]) delete next[name]; });
      return next;
    });
  }, [site]);

  const cancelPreview = useCallback(() => setPreview({}), []);

  const savePreview = useCallback(async () => {
    const { data } = await api.put('/settings', preview, authHeaders());
    updateSite(data);
    setPreview({});
  }, [preview, updateSite]);

  return (
    <ThemeContext.Provider value={{ site, preview, active, theme, background, previewSettings, cancelPreview, savePreview }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
