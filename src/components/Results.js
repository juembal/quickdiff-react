import React from 'react';
import ChangeSummary from './ChangeSummary';
import DiffView from './DiffView';
import AIResults from './AIResults';
import Minimap from './Minimap';

const Results = ({
  diffResult,
  settings,
  changes,
  currentChangeIndex,
  minimapVisible,
  onNavigatePrevious,
  onNavigateNext,
  onToggleMinimap,
  onNavigateToChange,
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
          <div className="nav-divider"></div>
          <button 
            className="btn btn-secondary btn-export" 
            onClick={onToggleMinimap}
            title="Toggle Minimap"
          >
            🗺️ {minimapVisible ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>
      
      {minimapVisible && (
        <Minimap 
          changes={changes} 
          currentChangeIndex={currentChangeIndex}
          onChangeClick={onNavigateToChange}
        />
      )}
      
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