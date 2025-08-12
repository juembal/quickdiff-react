import React from 'react';

const Controls = ({
  onCompare,
  onClear,
  onSwap,
  onCopy,
  onExportTxt,
  onExportHtml,
  onExportMd,
  onExportPdf,
  onAIAnalysis,
  hasResults,
  isGeneratingAI,
  groqConfigured
}) => {
  return (
    <div className="controls">
      <div className="controls-grid">
        <div className="main-controls">
          <button className="btn btn-primary" onClick={onCompare}>
            ▶ Compare Texts
          </button>
          <button className="btn btn-secondary" onClick={onClear}>
            ✕ Clear All
          </button>
          <button className="btn btn-secondary" onClick={onSwap}>
            ⇄ Swap Texts
          </button>
        </div>
        
        <div className="export-controls">
          <label className="controls-label">Export:</label>
          <div className="controls-buttons">
            <button 
              className="btn btn-secondary btn-export" 
              onClick={onCopy}
              disabled={!hasResults}
            >
              📋 Copy
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={onExportTxt}
              disabled={!hasResults}
            >
              📄 TXT
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={onExportHtml}
              disabled={!hasResults}
            >
              🌐 HTML
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={onExportMd}
              disabled={!hasResults}
            >
              📝 MD
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={onExportPdf}
              disabled={!hasResults}
            >
              📑 PDF
            </button>
          </div>
        </div>
        
        <div className="ai-controls">
          <label className="controls-label">AI Tools:</label>
          <div className="controls-buttons">
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('explain')}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? '🔄' : '🧠'} Explain
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('rewrite')}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? '🔄' : '✨'} Rewrite
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('summary')}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? '🔄' : '📝'} Summary
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('tone')}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? '🔄' : '🎭'} Tone
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('cleanup')}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? '🔄' : '🧹'} Cleanup
            </button>
          </div>
          <div className="ai-status">
            <small>
              {groqConfigured ? '✅ Groq AI Ready' : '⚠️ Local Analysis Only'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;