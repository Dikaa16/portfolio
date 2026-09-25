import React from 'react';
import FilterButtons from '../../components/FilterButtons';
import { EXPERIENCE_TYPES } from './sections';

const unique = (values) => [...new Set(values.filter(Boolean))];

// Manage-view filters enabled per section: 'type' | 'category' | 'tag'
function FilterBar({ enabled = [], items, shownCount, filters, onChange }) {
  const categories = unique(items.map(item => item.category));
  const tags = unique(items.flatMap(item => item.tags || []));

  return (
    <div className="admin-filters">
      {enabled.includes('type') && (
        <FilterButtons
          options={EXPERIENCE_TYPES}
          active={filters.type}
          onSelect={(type) => onChange({ type })}
          includeAll={false}
        />
      )}
      {enabled.includes('category') && (
        <FilterButtons
          label="Category"
          options={categories}
          active={filters.category}
          onSelect={(category) => onChange({ category, tag: 'all' })}
        />
      )}
      {enabled.includes('tag') && (
        <FilterButtons
          label="Tag"
          options={tags}
          active={filters.tag}
          onSelect={(tag) => onChange({ tag })}
        />
      )}
      {shownCount !== items.length && (
        <p className="admin-filter-count">Showing {shownCount} of {items.length} items</p>
      )}
    </div>
  );
}

export default FilterBar;
