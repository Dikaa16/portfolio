import React from 'react';

// Two identical wave periods side by side; sliding by half the width loops seamlessly
const WAVE_PATH =
  'M0,60 C240,20 480,20 720,60 C960,100 1200,100 1440,60 ' +
  'C1680,20 1920,20 2160,60 C2400,100 2640,100 2880,60 V120 H0 Z';

// Coastal: layered waves rolling along the bottom under a soft sun glow
function Waves() {
  return (
    <>
      <div className="wave-glow" />
      {[1, 2, 3].map(n => (
        <svg key={n} className={`wave wave-${n}`} viewBox="0 0 2880 120" preserveAspectRatio="none">
          <path d={WAVE_PATH} />
        </svg>
      ))}
    </>
  );
}

export default Waves;
