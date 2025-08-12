import React from 'react';

// Function to preserve exact AI content formatting - minimal processing to maintain original spacing
const formatAIContent = (content) => {
  if (!content) return '';
  
  // Minimal processing to preserve exact Groq AI output
  let formatted = content
    // Only convert **text** to bold for proper HTML display
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert section headers with emojis (preserve exact spacing)
    .replace(/^(📊|📝|🧠|🎨|🏗️|📋|🔍|✨|🎯|🔧|💡|🎭|🧹|📄|🌡️|⚖️|🔄|🌍|🔲|📏|💬|🧽|📐) \*\*(.*?)\*\*$/gm, '<h3 class="ai-section-header"><span class="ai-emoji">$1</span> <strong>$2</strong></h3>')
    // Convert bullet points (preserve exact spacing and content)
    .replace(/^• (.*?)$/gm, '<div class="ai-bullet-point">• $1</div>')
    // Convert line breaks to HTML breaks (preserve exact line structure)
    .replace(/\n/g, '<br>')
    // Clean up multiple consecutive breaks
    .replace(/<br><br><br>/g, '<br><br>');
  
  // Wrap in a container div to maintain structure
  formatted = '<div class="ai-content-exact">' + formatted + '</div>';
  
  return formatted;
};

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
        <div className="ai-content-wrapper" dangerouslySetInnerHTML={{ __html: formatAIContent(result.content) }} />
      </div>
    </div>
  );
};

export default AIResults;