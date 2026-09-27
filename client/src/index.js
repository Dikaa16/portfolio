import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { getTheme } from './themes/themes';
import { applyTheme, cachedSetting } from './themes/engine';

// Apply the last known theme before the first paint to avoid a flash of the default
applyTheme(getTheme(cachedSetting('theme')));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);