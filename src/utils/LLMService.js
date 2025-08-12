/**
 * LLM Service for QuickDiff React App
 * Supports multiple LLM providers: OpenAI, Anthropic, Ollama (local), and Gemini
 */

export class LLMService {
  constructor() {
    this.config = {
      provider: 'openai', // 'openai', 'anthropic', 'ollama', 'gemini'
      apiKey: '', // Set via environment or user input
      model: 'gpt-3.5-turbo', // Default model
      baseUrl: 'https://api.openai.com/v1', // Can be changed for local/custom endpoints
      maxTokens: 1000,
      temperature: 0.7
    };
    
    // Load config from localStorage if available
    this.loadConfig();
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('quickdiff_llm_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Error loading LLM config:', error);
    }
  }

  saveConfig() {
    try {
      // Don't save API key to localStorage for security
      const configToSave = { ...this.config };
      delete configToSave.apiKey;
      localStorage.setItem('quickdiff_llm_config', JSON.stringify(configToSave));
    } catch (error) {
      console.error('Error saving LLM config:', error);
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig() {
    return { ...this.config };
  }

  // Check if LLM is properly configured
  isConfigured() {
    if (this.config.provider === 'ollama') {
      return true; // Ollama doesn't require API key
    }
    return this.config.apiKey && this.config.apiKey.trim().length > 0;
  }

  // Generate analysis using the configured LLM
  async generateAnalysis(type, originalText, changedText) {
    if (!this.isConfigured()) {
      throw new Error('LLM not configured. Please set up your API key and provider.');
    }

    const prompt = this.createPrompt(type, originalText, changedText);
    
    try {
      const response = await this.callLLM(prompt);
      return this.formatResponse(type, response);
    } catch (error) {
      console.error('LLM API Error:', error);
      throw new Error(`Failed to generate ${type} analysis: ${error.message}`);
    }
  }

  // Create appropriate prompt based on analysis type
  createPrompt(type, originalText, changedText) {
    const baseContext = `You are analyzing text differences. Here are the texts:

ORIGINAL TEXT:
${originalText || '(empty)'}

CHANGED TEXT:
${changedText || '(empty)'}

`;

    switch (type) {
      case 'explain':
        return baseContext + `Please provide a detailed explanation of the differences between these texts. Focus on:
1. What specific changes were made
2. The significance of these changes
3. Potential impact or implications
4. Key statistics (word count, line count changes)

Format your response in HTML with appropriate headings and structure.`;

      case 'rewrite':
        return baseContext + `Please provide specific rewrite suggestions to improve the text. Focus on:
1. Style and clarity improvements
2. Grammar and syntax corrections
3. Structure and organization suggestions
4. Tone and readability enhancements

Format your response in HTML with specific, actionable suggestions.`;

      case 'summary':
        return baseContext + `Please provide a concise summary of both texts, highlighting:
1. Main topics and themes
2. Key differences between versions
3. Important information preserved or lost
4. Overall content assessment

Format your response in HTML with clear sections.`;

      case 'tone':
        return baseContext + `Please analyze the tone and style of both texts. Include:
1. Sentiment analysis (positive, negative, neutral)
2. Formality level assessment
3. Writing style characteristics
4. Tone changes between versions
5. Recommendations for tone consistency

Format your response in HTML with detailed analysis.`;

      case 'cleanup':
        return baseContext + `Please analyze the text for formatting and cleanup issues. Identify:
1. Formatting inconsistencies
2. Punctuation and spacing issues
3. Structural problems
4. Specific cleanup recommendations
5. Best practices for improvement

Format your response in HTML with actionable cleanup suggestions.`;

      default:
        return baseContext + `Please analyze these texts and provide insights about their differences and characteristics. Format your response in HTML.`;
    }
  }

  // Call the appropriate LLM API based on provider
  async callLLM(prompt) {
    switch (this.config.provider) {
      case 'openai':
        return await this.callOpenAI(prompt);
      case 'anthropic':
        return await this.callAnthropic(prompt);
      case 'ollama':
        return await this.callOllama(prompt);
      case 'gemini':
        return await this.callGemini(prompt);
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  // OpenAI API call
  async callOpenAI(prompt) {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes text differences and provides detailed insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Anthropic Claude API call
  async callAnthropic(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // Ollama local API call
  async callOllama(prompt) {
    const ollamaUrl = this.config.baseUrl || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt: prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  // Google Gemini API call
  async callGemini(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Format the LLM response into the expected structure
  formatResponse(type, content) {
    const typeIcons = {
      explain: '🧠',
      rewrite: '✨',
      summary: '📝',
      tone: '🎭',
      cleanup: '🧹'
    };

    const typeTitles = {
      explain: 'AI Explanation',
      rewrite: 'AI Rewrite Suggestions',
      summary: 'AI Summary',
      tone: 'AI Tone Analysis',
      cleanup: 'AI Text Cleanup'
    };

    return {
      title: `${typeIcons[type] || '🤖'} ${typeTitles[type] || 'AI Analysis'}`,
      content: `<div class="ai-${type}">${content}</div>`,
      type: type
    };
  }

  // Test the LLM connection
  async testConnection() {
    try {
      const testPrompt = "Please respond with 'Connection successful!' to test the API.";
      const response = await this.callLLM(testPrompt);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get available models for the current provider
  getAvailableModels() {
    switch (this.config.provider) {
      case 'openai':
        return [
          'gpt-4',
          'gpt-4-turbo-preview',
          'gpt-3.5-turbo',
          'gpt-3.5-turbo-16k'
        ];
      case 'anthropic':
        return [
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ];
      case 'ollama':
        return [
          'llama2',
          'llama2:13b',
          'llama2:70b',
          'codellama',
          'mistral',
          'neural-chat'
        ];
      case 'gemini':
        return [
          'gemini-pro',
          'gemini-pro-vision'
        ];
      default:
        return [];
    }
  }
}