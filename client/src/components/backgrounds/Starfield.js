import React, { useMemo } from 'react';

// Three layers of stars (far, mid, near) that twinkle and drift upwards at
// different speeds. Each layer is one repeating tile of radial-gradient dots.
const LAYERS = [
  { tile: 220, count: 14, size: 1 },
  { tile: 340, count: 10, size: 1.5 },
  { tile: 520, count: 7, size: 2.2 }
];

// Seeded, so the sky looks the same on every visit
const random = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const layerStyle = ({ tile, count, size }, index) => {
  const next = random(index + 7);
  const stars = Array.from({ length: count }, () => {
    const x = Math.round(next() * tile);
    const y = Math.round(next() * tile);
    return `radial-gradient(${size}px ${size}px at ${x}px ${y}px, var(--star-color), transparent)`;
  });
  return { backgroundImage: stars.join(', '), backgroundSize: `${tile}px ${tile}px`, '--tile': `${tile}px` };
};

function Starfield() {
  const layers = useMemo(() => LAYERS.map(layerStyle), []);
  return (
    <>
      <div className="star-nebula" />
      {layers.map((style, i) => (
        <div key={i} className={`star-layer star-layer-${i + 1}`} style={style} />
      ))}
    </>
  );
}

export default Starfield;
