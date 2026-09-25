import React from 'react';

function ItemCard({ item, card, position, total, reorderable, onMove, onEdit, onDelete }) {
  const badge = card.badge?.(item);
  const meta = card.meta?.(item);
  return (
    <div className="item-card">
      <div className="item-content">
        <h3>{card.title(item)}</h3>
        {meta && <p className="item-meta">{meta}</p>}
        <p className="item-desc">{card.description?.(item)}</p>
        {card.showTags && item.tags?.length > 0 && <p className="item-tags">Tags: {item.tags.join(', ')}</p>}
        {badge && <span className={`status-badge ${badge.tone}`}>{badge.label}</span>}
      </div>
      <div className="item-actions">
        {reorderable && (
          <div className="item-reorder">
            <button onClick={() => onMove(item, -1)} className="btn-reorder" disabled={position === 0}>↑</button>
            <button onClick={() => onMove(item, 1)} className="btn-reorder" disabled={position === total - 1}>↓</button>
            <span className="item-order">Order: {position + 1}</span>
          </div>
        )}
        <button onClick={() => onEdit(item)} className="btn-edit">Edit</button>
        <button onClick={() => onDelete(item)} className="btn-delete">Delete</button>
      </div>
    </div>
  );
}

function ItemList({ items, section, loading, onCreate, ...actions }) {
  if (loading) return <div className="loading">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No {section.plural.toLowerCase()} match the current filters.</p>
        <button onClick={onCreate} className="btn">Create New</button>
      </div>
    );
  }

  return (
    <div className="items-list">
      {items.map((item, index) => (
        <ItemCard
          key={item._id}
          item={item}
          card={section.card}
          position={index}
          total={items.length}
          reorderable={section.reorderable}
          {...actions}
        />
      ))}
    </div>
  );
}

export default ItemList;
