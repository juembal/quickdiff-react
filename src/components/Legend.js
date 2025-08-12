import React from 'react';

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <span className="legend-color added"></span>
        <span>Added</span>
      </div>
      <div className="legend-item">
        <span className="legend-color removed"></span>
        <span>Removed</span>
      </div>
    </div>
  );
};

export default Legend;