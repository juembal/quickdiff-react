import React from 'react';
import ChangeSummary from './ChangeSummary';
import DiffView from './DiffView';
import AIResults from './AIResults';

const Results = ({
  diffResult,
  settings,
  changes,
  currentChangeIndex,
  onNavigatePrevious,
  onNavigateNext,
  aiResults,
  showAiResults,
  onClearAIResults,
  onRemoveAICard
}) => {
  if (!diffResult) return null;

  return (
    <div id="results-section" className="results-section">
      <ChangeSummary stats={diffResult.stats} />
      
      <div className="results-header">
        <h2>🔍 Comparison Results</h2>
        <div className="diff-navigation">
          <button 
            className="btn btn-secondary btn-icon-only" 
            onClick={onNavigatePrevious}
            disabled={changes.length === 0}
            title="Previous Change"
          >
            ⬆️
          </button>
          <span className="change-counter">
            {changes.length === 0 ? '0 / 0' : `${currentChangeIndex + 1} / ${changes.length}`}
          </span>
          <button 
            className="btn btn-secondary btn-icon-only" 
            onClick={onNavigateNext}
            disabled={changes.length === 0}
            title="Next Change"
          >
            ⬇️
          </button>
        </div>
      </div>
      
      <DiffView 
        diffResult={diffResult}
        viewMode={settings.viewMode}
        currentChangeIndex={currentChangeIndex}
      />
      
      {showAiResults && (
        <AIResults 
          results={aiResults}
          onClear={onClearAIResults}
          onRemoveCard={onRemoveAICard}
        />
      )}
    </div>
  );
};

export default Results;