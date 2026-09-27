import React from 'react';

// 80s synthwave: striped sun on the horizon over a glowing grid floor that
// scrolls towards the viewer
function SunsetGrid() {
  return (
    <>
      <div className="sunset-sky" />
      <div className="sunset-sun-clip">
        <div className="sunset-sun" />
      </div>
      <div className="sunset-floor">
        <div className="sunset-grid" />
      </div>
    </>
  );
}

export default SunsetGrid;
