import React from 'react';
import { techIconUrl } from '../lib/techIcons';

const hideOnError = (e) => { e.target.style.display = 'none'; };

function TechTag({ name }) {
  const icon = techIconUrl(name);
  return (
    <span className="tech-tag">
      {icon && <img src={icon} alt="" className="tech-icon" onError={hideOnError} />}
      {name}
    </span>
  );
}

export function TechStack({ items }) {
  if (!items?.length) return null;
  return (
    <div className="tech-stack">
      {items.map((name, i) => <TechTag key={`${name}-${i}`} name={name} />)}
    </div>
  );
}

export default TechTag;
