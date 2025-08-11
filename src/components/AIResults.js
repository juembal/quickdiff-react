import React from 'react';

const AIResults = ({ results, onClear, onRemoveCard }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="ai-results-section">
      <div className="ai-results-header">
        <h2>🧠 AI Analysis Results</h2>
        <button className="ai-clear-all btn btn-secondary" onClick={onClear}>
          Clear All
        </button>
      </div>
      <div className="ai-cards-container">
        {results.map((result, index) => (
          <AICard 
            key={index} 
            result={result} 
            index={index}
            onRemove={onRemoveCard}
          />
        ))}
      </div>
    </div>
  );
};

const AICard = ({ result, index, onRemove }) => {
  return (
    <div className="ai-analysis-card">
      <div className="ai-card-header">
        <h3 className="ai-card-title">{result.title}</h3>
        <button 
          className="ai-card-close"
          onClick={() => onRemove && onRemove(index)}
          title="Remove this analysis"
        >
          ×
        </button>
      </div>
      <div className="ai-card-content">
        <div dangerouslySetInnerHTML={{ __html: result.content }} />
      </div>
    </div>
  );
};

export default AIResults;