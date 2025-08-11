import React from 'react';

const ChangeSummary = ({ stats }) => {
  if (!stats) return null;

  const totalChanges = (stats.linesAdded || 0) + (stats.linesRemoved || 0) + (stats.linesModified || 0);

  return (
    <div className="change-summary">
      <h2>📈 Change Summary</h2>
      <div className="summary-stats">
        <div className="summary-item added">
          <span className="summary-number">{stats.linesAdded || stats.wordsAdded || 0}</span>
          <span className="summary-label">Added</span>
        </div>
        <div className="summary-item removed">
          <span className="summary-number">{stats.linesRemoved || stats.wordsRemoved || 0}</span>
          <span className="summary-label">Removed</span>
        </div>
        <div className="summary-item modified">
          <span className="summary-number">{stats.linesModified || 0}</span>
          <span className="summary-label">Modified</span>
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