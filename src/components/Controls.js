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
  hasResults
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
            >
              🧠 Explain
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('rewrite')}
            >
              ✨ Rewrite
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('summary')}
            >
              📝 Summary
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('tone')}
            >
              🎭 Tone
            </button>
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => onAIAnalysis('cleanup')}
            >
              🧹 Cleanup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;