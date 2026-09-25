import React, { useEffect, useState } from 'react';
import { techIconUrl } from '../lib/techIcons';
import { detectIconTone } from '../lib/iconTone';

const hideOnError = (e) => { e.target.style.display = 'none'; };

function TechIcon({ src }) {
  const [tone, setTone] = useState('normal');

  useEffect(() => {
    let current = true;
    detectIconTone(src).then(result => { if (current) setTone(result); });
    return () => { current = false; };
  }, [src]);

  return (
    <img
      src={src}
      alt=""
      // Same CORS mode as the tone check, so the browser can reuse one download
      crossOrigin="anonymous"
      className={`tech-icon ${tone === 'normal' ? '' : `tech-icon--${tone}`}`}
      onError={hideOnError}
    />
  );
}

function TechTag({ name }) {
  const icon = techIconUrl(name);
  return (
    <span className="tech-tag">
      {icon && <TechIcon src={icon} />}
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
