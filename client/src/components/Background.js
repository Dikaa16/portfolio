import React from 'react';
import { useTheme } from '../themes/ThemeContext';

// The layer behind every page. `thumbnail` renders it inside its parent
// (for the admin picker) instead of fixed to the viewport.
function Background({ background, thumbnail = false }) {
  const { background: active } = useTheme();
  const { id, Component } = background || active;
  if (!Component) return null;
  return (
    <div className={`bg-elements bg-${id} ${thumbnail ? 'bg-thumbnail' : ''}`} aria-hidden="true">
      <Component />
    </div>
  );
}

export default Background;
