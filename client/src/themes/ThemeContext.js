import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, authHeaders } from '../lib/api';
import { DEFAULT_THEME_ID, getTheme } from './themes';
import { applyTheme, cachedThemeId, cacheThemeId } from './engine';

const ThemeContext = createContext(null);

// siteThemeId: what every visitor sees (stored in the API)
// previewId:   a theme the admin is trying out; only this browser sees it
export function ThemeProvider({ children }) {
  const [siteThemeId, setSiteThemeId] = useState(() => cachedThemeId() || DEFAULT_THEME_ID);
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        setSiteThemeId(data.theme);
        cacheThemeId(data.theme);
      })
      .catch(error => console.error('Could not load site theme:', error));
  }, []);

  const activeId = previewId ?? siteThemeId;

  useEffect(() => {
    applyTheme(getTheme(activeId));
  }, [activeId]);

  const saveTheme = useCallback(async (id) => {
    const { data } = await api.put('/settings', { theme: id }, authHeaders());
    setSiteThemeId(data.theme);
    cacheThemeId(data.theme);
    setPreviewId(null);
  }, []);

  const cancelPreview = useCallback(() => setPreviewId(null), []);

  return (
    <ThemeContext.Provider value={{ siteThemeId, previewId, activeId, previewTheme: setPreviewId, cancelPreview, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
