import React, { useRef } from 'react';

const InputSection = ({ 
  originalText, 
  changedText, 
  onOriginalTextChange, 
  onChangedTextChange, 
  onFileLoad,
  showNotification 
}) => {
  console.log('🔧 InputSection component rendered');
  console.log('🔧 showNotification available:', !!showNotification);
  console.log('🔧 onFileLoad available:', !!onFileLoad);
  
  const originalFileRef = useRef(null);
  const changedFileRef = useRef(null);

  // Simple file size checker - returns true if file is too large
  const isFileTooLarge = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB for ALL files
    
    console.log('🔍 FILE SIZE CHECK:');
    console.log('File name:', file.name);
    console.log('File size (MB):', (file.size / 1024 / 1024).toFixed(2));
    console.log('Max allowed (MB): 5');
    console.log('Is too large:', file.size > maxSize);
    
    return file.size > maxSize;
  };

  // Show file too large notification (app notification only, no browser alert)
  const showFileTooLargeError = (file) => {
    console.log('🚨 showFileTooLargeError called for:', file.name);
    
    const sizeInMB = (file.size / 1024 / 1024).toFixed(1);
    const maxSizeMB = '5';
    
    console.log(`🚫 SHOWING ERROR: ${file.name} is ${sizeInMB}MB (max: ${maxSizeMB}MB)`);
    
    // Show app notification only
    if (showNotification) {
      console.log('📢 Showing app notification...');
      showNotification(`❌ File too large: ${sizeInMB}MB (max: ${maxSizeMB}MB)`, 'error', 8000);
      console.log('📢 App notification shown');
    } else {
      console.log('❌ showNotification is not available');
    }
  };

  // NEW: Simple file handler for button clicks
  const handleFileSelect = (event, target) => {
    console.log('🚀 handleFileSelect called');
    const file = event.target.files[0];
    
    console.log('📁 Raw file object:', file);
    
    if (!file) {
      console.log('❌ No file found');
      return;
    }
    
    console.log(`📁 File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    
    // Check file size FIRST
    console.log('🔍 About to check file size...');
    const tooLarge = isFileTooLarge(file);
    console.log('📊 Size check result:', tooLarge);
    
    if (tooLarge) {
      console.log('🚫 FILE IS TOO LARGE - SHOWING ERROR');
      showFileTooLargeError(file);
      // Clear the input AFTER showing error
      event.target.value = '';
      console.log('🛑 STOPPED - NOT CALLING onFileLoad');
      return; // STOP HERE - no processing
    }
    
    // File is OK, proceed with loading
    console.log(`✅ File size OK, proceeding with load...`);
    // Clear the input before processing
    event.target.value = '';
    
    onFileLoad(file, target).catch(error => {
      console.error('File load error:', error);
    });
  };

  // NEW: Simple drag and drop handler
  const handleFileDrop = (e, target) => {
    console.log('🚀 handleFileDrop called');
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    console.log('📁 Dropped files:', files);
    
    if (files.length === 0) {
      console.log('❌ No files found in drop');
      return;
    }
    
    const file = files[0];
    console.log('📁 Raw dropped file object:', file);
    console.log(`📁 File dropped: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    
    // Check file size FIRST
    console.log('🔍 About to check dropped file size...');
    const tooLarge = isFileTooLarge(file);
    console.log('📊 Drop size check result:', tooLarge);
    
    if (tooLarge) {
      console.log('🚫 DROPPED FILE IS TOO LARGE - SHOWING ERROR');
      showFileTooLargeError(file);
      console.log('🛑 STOPPED - NOT CALLING onFileLoad for dropped file');
      return; // STOP HERE - no processing
    }
    
    // File is OK, proceed with loading
    console.log(`✅ Dropped file size OK, proceeding with load...`);
    onFileLoad(file, target).catch(error => {
      console.error('File load error:', error);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
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
              accept=".txt,.md,.json,.html,.js,.py,.css,.xml,.csv,.log,.pdf" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'original')}
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
          onDrop={(e) => handleFileDrop(e, 'original')}
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
              accept=".txt,.md,.json,.html,.js,.py,.css,.xml,.csv,.log,.pdf" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'changed')}
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
          onDrop={(e) => handleFileDrop(e, 'changed')}
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