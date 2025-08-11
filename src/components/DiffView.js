import React from 'react';

const DiffView = ({ diffResult, viewMode, currentChangeIndex }) => {
  if (!diffResult) return null;

  const renderDiffLine = (line, lineNumber, type = '') => {
    const isCurrentChange = currentChangeIndex >= 0 && line.isCurrentChange;
    const className = `diff-line ${type} ${isCurrentChange ? 'current-change' : ''}`.trim();

    return (
      <div 
        key={`${type}-${lineNumber}`} 
        className={className}
        data-line-number={lineNumber}
        data-line-type={type}
      >
        <span className="line-number">{lineNumber}</span>
        <span 
          className="line-content"
          dangerouslySetInnerHTML={{ __html: line.content || line }}
        />
      </div>
    );
  };

  if (viewMode === 'side-by-side') {
    return (
      <div className="diff-container side-by-side">
        <div className="diff-column">
          <h3>Original Text</h3>
          <div className="diff-content">
            {diffResult.originalLines?.map((line, index) => 
              renderDiffLine(line, index + 1, line.type)
            )}
          </div>
        </div>
        <div className="diff-column">
          <h3>Changed Text</h3>
          <div className="diff-content">
            {diffResult.changedLines?.map((line, index) => 
              renderDiffLine(line, index + 1, line.type)
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline view - combine both original and changed lines
  const createUnifiedView = () => {
    const unified = [];
    const maxLines = Math.max(
      diffResult.originalLines?.length || 0,
      diffResult.changedLines?.length || 0
    );
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = diffResult.originalLines?.[i];
      const changedLine = diffResult.changedLines?.[i];
      
      if (originalLine && originalLine.type === 'removed') {
        unified.push(originalLine);
      }
      if (changedLine && changedLine.type === 'added') {
        unified.push(changedLine);
      }
      if (originalLine && (!originalLine.type || originalLine.type === 'unchanged')) {
        unified.push(originalLine);
      }
    }
    
    return unified;
  };

  return (
    <div className="diff-container inline">
      <div className="diff-column full-width">
        <h3>Unified Diff View</h3>
        <div className="diff-content">
          {createUnifiedView().map((line, index) => 
            renderDiffLine(line, index + 1, line.type)
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffView;