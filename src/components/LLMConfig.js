import React, { useState, useEffect } from 'react';
import { LLMService } from '../utils/LLMService';
import { useNotification } from './NotificationProvider';
import './LLMConfig.css';

const LLMConfig = ({ isOpen, onClose, llmService }) => {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && llmService) {
      setConfig(llmService.getConfig());
    }
  }, [isOpen, llmService]);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    llmService.updateConfig(config);
    showNotification('LLM configuration saved');
    onClose();
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Temporarily update the service config for testing
      const originalConfig = llmService.getConfig();
      llmService.updateConfig(config);
      
      const result = await llmService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        showNotification('✅ LLM connection successful!');
      } else {
        showNotification('❌ LLM connection failed');
      }
      
      // Restore original config if test failed
      if (!result.success) {
        llmService.updateConfig(originalConfig);
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      showNotification('❌ LLM connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderInfo = (provider) => {
    const info = {
      openai: {
        name: 'OpenAI',
        description: 'GPT models (requires API key)',
        keyLabel: 'OpenAI API Key',
        keyPlaceholder: 'sk-...',
        baseUrlLabel: 'API Base URL (optional)',
        baseUrlPlaceholder: 'https://api.openai.com/v1'
      },
      anthropic: {
        name: 'Anthropic Claude',
        description: 'Claude models (requires API key)',
        keyLabel: 'Anthropic API Key',
        keyPlaceholder: 'sk-ant-...',
        baseUrlLabel: 'API Base URL (optional)',
        baseUrlPlaceholder: 'https://api.anthropic.com/v1'
      },
      ollama: {
        name: 'Ollama (Local)',
        description: 'Local models via Ollama (no API key needed)',
        keyLabel: null,
        keyPlaceholder: null,
        baseUrlLabel: 'Ollama URL',
        baseUrlPlaceholder: 'http://localhost:11434'
      },
      gemini: {
        name: 'Google Gemini',
        description: 'Gemini models (requires API key)',
        keyLabel: 'Google API Key',
        keyPlaceholder: 'AIza...',
        baseUrlLabel: 'API Base URL (optional)',
        baseUrlPlaceholder: 'https://generativelanguage.googleapis.com'
      }
    };
    return info[provider] || {};
  };

  if (!isOpen) return null;

  const providerInfo = getProviderInfo(config.provider);
  const availableModels = llmService?.getAvailableModels() || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content llm-config-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🤖 LLM Configuration</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="config-section">
            <label>
              <strong>LLM Provider:</strong>
              <select 
                value={config.provider || 'openai'} 
                onChange={e => handleConfigChange('provider', e.target.value)}
              >
                <option value="openai">OpenAI (GPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </label>
            <p className="provider-description">{providerInfo.description}</p>
          </div>

          {providerInfo.keyLabel && (
            <div className="config-section">
              <label>
                <strong>{providerInfo.keyLabel}:</strong>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={e => handleConfigChange('apiKey', e.target.value)}
                  placeholder={providerInfo.keyPlaceholder}
                />
              </label>
              <p className="config-note">
                ⚠️ Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          )}

          <div className="config-section">
            <label>
              <strong>Model:</strong>
              <select 
                value={config.model || ''} 
                onChange={e => handleConfigChange('model', e.target.value)}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>
          </div>

          {providerInfo.baseUrlLabel && (
            <div className="config-section">
              <label>
                <strong>{providerInfo.baseUrlLabel}:</strong>
                <input
                  type="text"
                  value={config.baseUrl || ''}
                  onChange={e => handleConfigChange('baseUrl', e.target.value)}
                  placeholder={providerInfo.baseUrlPlaceholder}
                />
              </label>
            </div>
          )}

          <div className="config-section">
            <div className="config-row">
              <label>
                <strong>Max Tokens:</strong>
                <input
                  type="number"
                  value={config.maxTokens || 1000}
                  onChange={e => handleConfigChange('maxTokens', parseInt(e.target.value))}
                  min="100"
                  max="4000"
                />
              </label>
              
              <label>
                <strong>Temperature:</strong>
                <input
                  type="number"
                  value={config.temperature || 0.7}
                  onChange={e => handleConfigChange('temperature', parseFloat(e.target.value))}
                  min="0"
                  max="2"
                  step="0.1"
                />
              </label>
            </div>
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
            disabled={isLoading || (config.provider !== 'ollama' && !config.apiKey)}
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

export default LLMConfig;