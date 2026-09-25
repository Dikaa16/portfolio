import React from 'react';

// Row of single-choice filter chips, optionally with an "All" option first
function FilterButtons({ options, active, onSelect, label, allValue = 'all', includeAll = true }) {
  if (options.length === 0) return null;

  const chip = (value, text) => (
    <button
      key={value}
      type="button"
      onClick={() => onSelect(value)}
      className={`filter-btn ${active === value ? 'active' : ''}`}
    >
      {text}
    </button>
  );

  return (
    <div className="creatives-filter-row">
      {label && <span className="creatives-filter-label">{label}</span>}
      <div className="creatives-filter-buttons">
        {includeAll && chip(allValue, 'All')}
        {options.map(option => chip(option, option))}
      </div>
    </div>
  );
}

export default FilterButtons;
