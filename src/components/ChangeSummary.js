import React from 'react';

const ChangeSummary = ({ stats }) => {
  if (!stats) return null;

  // Determine whether we're dealing with lines or words
  const addedCount = stats.linesAdded ?? stats.wordsAdded ?? 0;
  const removedCount = stats.linesRemoved ?? stats.wordsRemoved ?? 0;
  const totalChanges = addedCount + removedCount;

  // Determine the unit type for labels
  const unitType = (stats.linesAdded !== undefined || stats.linesRemoved !== undefined) ? 'Lines' : 'Words';

  return (
    <div className="change-summary">
      <h2>📈 Change Summary</h2>
      <div className="summary-stats">
        <div className="summary-item added">
          <span className="summary-number">{addedCount}</span>
          <span className="summary-label">{unitType} Added</span>
        </div>
        <div className="summary-item removed">
          <span className="summary-number">{removedCount}</span>
          <span className="summary-label">{unitType} Removed</span>
        </div>
        <div className="summary-item total">
          <span className="summary-number">{totalChanges}</span>
          <span className="summary-label">Total Changes</span>
        </div>
      </div>
    </div>
  );
};

export default ChangeSummary;