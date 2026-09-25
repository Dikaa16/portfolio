import React from 'react';

// Circular +/− toggle; the icon is drawn in CSS from aria-expanded
function ExpandButton({ expanded, onClick, style }) {
  return (
    <button
      type="button"
      className="expand-btn"
      onClick={onClick}
      style={style}
      aria-expanded={expanded}
      aria-label={expanded ? 'Collapse' : 'Expand'}
    />
  );
}

export default ExpandButton;
