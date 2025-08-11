import React, { useRef } from 'react';

const InputSection = ({ 
  originalText, 
  changedText, 
  onOriginalTextChange, 
  onChangedTextChange, 
  onFileLoad 
}) => {
  const originalFileRef = useRef(null);
  const changedFileRef = useRef(null);

  const handleFileChange = (event, target) => {
    const file = event.target.files[0];
    if (file) {
      onFileLoad(file, target);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileLoad(files[0], target);
    }
  };

  return (
    <div className="input-section">
      <div className="input-group">
        <div className="input-header">
          <label htmlFor="originalText">Original Text</label>
          <div className="file-controls">
            <input 
              type="file" 
              ref={originalFileRef}
              accept=".txt,.md,.json,.html,.js,.py,.css" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'original')}
            />
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => originalFileRef.current?.click()}
            >
              📁 Load File
            </button>
          </div>
        </div>
        <div 
          className="textarea-container" 
          data-drop-zone="original"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'original')}
        >
          <textarea 
            id="originalText"
            value={originalText}
            onChange={(e) => onOriginalTextChange(e.target.value)}
            placeholder="Paste your original text here or drag & drop a file..."
            rows="10"
          />
          <div className="drop-overlay">
            <div className="drop-message">
              <span>📁</span>
              <p>Drop file here</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <div className="input-header">
          <label htmlFor="changedText">Changed Text</label>
          <div className="file-controls">
            <input 
              type="file" 
              ref={changedFileRef}
              accept=".txt,.md,.json,.html,.js,.py,.css" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'changed')}
            />
            <button 
              className="btn btn-secondary btn-export" 
              onClick={() => changedFileRef.current?.click()}
            >
              📁 Load File
            </button>
          </div>
        </div>
        <div 
          className="textarea-container" 
          data-drop-zone="changed"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'changed')}
        >
          <textarea 
            id="changedText"
            value={changedText}
            onChange={(e) => onChangedTextChange(e.target.value)}
            placeholder="Paste your changed text here or drag & drop a file..."
            rows="10"
          />
          <div className="drop-overlay">
            <div className="drop-message">
              <span>📁</span>
              <p>Drop file here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;