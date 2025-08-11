import React from 'react';

const SettingsPanel = ({ settings, onSettingsChange, detectedLanguage }) => {
  const handleSettingChange = (key, value) => {
    onSettingsChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="settings-panel">
      <div className="settings-group">
        <label>Diff Mode:</label>
        <select 
          value={settings.diffMode}
          onChange={(e) => handleSettingChange('diffMode', e.target.value)}
        >
          <option value="line">Line-by-line</option>
          <option value="word">Word-by-word</option>
          <option value="char">Character-level</option>
        </select>
      </div>
      
      <div className="settings-group">
        <label>View Mode:</label>
        <select 
          value={settings.viewMode}
          onChange={(e) => handleSettingChange('viewMode', e.target.value)}
        >
          <option value="side-by-side">Side-by-side</option>
          <option value="inline">Inline</option>
        </select>
      </div>
      
      <div className="settings-group">
        <label>Language:</label>
        <div className="language-controls">
          <select 
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            disabled={settings.autoDetectLanguage}
            style={{ opacity: settings.autoDetectLanguage ? 0.6 : 1 }}
          >
            <option value="plaintext">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
            <option value="xml">XML</option>
            <option value="php">PHP</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="yaml">YAML</option>
            <option value="shell">Shell</option>
          </select>
          
          <label className="checkbox-label auto-detect-label">
            <input 
              type="checkbox" 
              checked={settings.autoDetectLanguage}
              onChange={(e) => handleSettingChange('autoDetectLanguage', e.target.checked)}
            />
            Auto-detect
          </label>
        </div>
        
      </div>
      
      <div className="settings-group ignore-options">
        <label>Ignore Options:</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.ignoreCase}
              onChange={(e) => handleSettingChange('ignoreCase', e.target.checked)}
            />
            Ignore Case
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.ignoreWhitespace}
              onChange={(e) => handleSettingChange('ignoreWhitespace', e.target.checked)}
            />
            Ignore Whitespace
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.ignorePunctuation}
              onChange={(e) => handleSettingChange('ignorePunctuation', e.target.checked)}
            />
            Ignore Punctuation
          </label>
        </div>
      </div>
      
      <div className="settings-group">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={settings.livePreview}
            onChange={(e) => handleSettingChange('livePreview', e.target.checked)}
          />
          Live Preview
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;