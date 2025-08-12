import React, { useState, useEffect } from 'react';
import { useNotification } from './NotificationProvider';
import './LLMConfig.css';

const HuggingFaceConfig = ({ isOpen, onClose, hfService }) => {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && hfService) {
      setConfig(hfService.getConfig());
    }
  }, [isOpen, hfService]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleModelChange = (category, model) => {
    setConfig(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [category]: model
      }
    }));
  };

  const handleSave = () => {
    hfService.updateConfig(config);
    showNotification('Hugging Face configuration saved');
    onClose();
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Temporarily update the service config for testing
      const originalConfig = hfService.getConfig();
      hfService.updateConfig(config);
      
      const result = await hfService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        showNotification('✅ Hugging Face connection successful!');
      } else {
        showNotification('❌ Hugging Face connection failed');
      }
      
      // Restore original config if test failed
      if (!result.success) {
        hfService.updateConfig(originalConfig);
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      showNotification('❌ Hugging Face connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const availableModels = hfService?.getAvailableModels() || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content llm-config-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🤗 Hugging Face Configuration</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="config-section">
            <h4>🔑 API Configuration</h4>
            <label>
              <strong>Hugging Face API Token:</strong>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={e => handleConfigChange('apiKey', e.target.value)}
                placeholder="hf_..."
              />
            </label>
            <p className="config-note">
              ⚠️ Get your free API token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer">Hugging Face Settings</a>
            </p>
          </div>

          <div className="config-section">
            <h4>🤖 Model Selection</h4>
            
            <label>
              <strong>Text Generation Model:</strong>
              <select 
                value={config.models?.textGeneration || ''} 
                onChange={e => handleModelChange('textGeneration', e.target.value)}
              >
                {availableModels.textGeneration?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>

            <label>
              <strong>Summarization Model:</strong>
              <select 
                value={config.models?.summarization || ''} 
                onChange={e => handleModelChange('summarization', e.target.value)}
              >
                {availableModels.summarization?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>

            <label>
              <strong>Sentiment Analysis Model:</strong>
              <select 
                value={config.models?.sentiment || ''} 
                onChange={e => handleModelChange('sentiment', e.target.value)}
              >
                {availableModels.sentiment?.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="config-section">
            <h4>⚙️ Advanced Settings</h4>
            <div className="config-row">
              <label>
                <strong>Max Length:</strong>
                <input
                  type="number"
                  value={config.maxLength || 1000}
                  onChange={e => handleConfigChange('maxLength', parseInt(e.target.value))}
                  min="100"
                  max="2000"
                />
              </label>
              
              <label>
                <strong>Temperature:</strong>
                <input
                  type="number"
                  value={config.temperature || 0.7}
                  onChange={e => handleConfigChange('temperature', parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                />
              </label>
            </div>

            <label>
              <input
                type="checkbox"
                checked={config.waitForModel || true}
                onChange={e => handleConfigChange('waitForModel', e.target.checked)}
              />
              <strong>Wait for model to load (recommended)</strong>
            </label>
          </div>

          <div className="config-section">
            <h4>ℹ️ About Hugging Face</h4>
            <ul className="info-list">
              <li>🆓 Free tier available with rate limits</li>
              <li>🚀 State-of-the-art AI models</li>
              <li>🔒 Your data is processed securely</li>
              <li>📚 Wide variety of specialized models</li>
            </ul>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              <h4>{testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}</h4>
              {testResult.error && <p>Error: {testResult.error}</p>}
              {testResult.response && <p>Response: {testResult.response}</p>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleTest}
            disabled={isLoading || !config.apiKey}
          >
            {isLoading ? '🔄 Testing...' : '🧪 Test Connection'}
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            💾 Save Configuration
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuggingFaceConfig;