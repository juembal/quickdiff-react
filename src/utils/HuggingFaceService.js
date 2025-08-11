/**
 * Hugging Face API Service for QuickDiff React App
 * Supports Hugging Face Inference API for text analysis
 */

export class HuggingFaceService {
  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_HUGGINGFACE_API_KEY || '', // Hugging Face API token from environment
      baseUrl: 'https://api-inference.huggingface.co/models',
      models: {
        textGeneration: 'microsoft/DialoGPT-medium', // More reliable text generation model
        textGenerationFallback: 'gpt2', // Fallback option
        summarization: 'facebook/bart-large-cnn', // Best summarization model
        sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest', // Best sentiment analysis
        textClassification: 'unitary/toxic-bert' // For cleanup analysis
      },
      maxLength: 1000,
      temperature: 0.7,
      waitForModel: true // Wait for model to load if needed
    };
    
    // Load config from localStorage if available
    this.loadConfig();
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('quickdiff_hf_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Don't override API key from environment with localStorage
        delete parsedConfig.apiKey;
        this.config = { ...this.config, ...parsedConfig };
      }
      
      // Ensure environment variable always takes precedence
      const envApiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
      if (envApiKey) {
        this.config.apiKey = envApiKey;
      }
    } catch (error) {
      console.error('Error loading Hugging Face config:', error);
    }
  }

  saveConfig() {
    try {
      // Don't save API key to localStorage for security
      const configToSave = { ...this.config };
      delete configToSave.apiKey;
      localStorage.setItem('quickdiff_hf_config', JSON.stringify(configToSave));
    } catch (error) {
      console.error('Error saving Hugging Face config:', error);
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig() {
    return { ...this.config };
  }

  // Check if Hugging Face is properly configured
  isConfigured() {
    const hasKey = this.config.apiKey && this.config.apiKey.trim().length > 0;
    const isValidKey = this.config.apiKey && this.config.apiKey.startsWith('hf_');
    const configured = hasKey && isValidKey;
    
    console.log('🔍 HuggingFace isConfigured check:', {
      envVar: process.env.REACT_APP_HUGGINGFACE_API_KEY ? 'Found' : 'Not found',
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey ? this.config.apiKey.length : 0,
      apiKeyPreview: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'none',
      startsWithHf: isValidKey,
      configured: configured
    });
    return configured;
  }

  // Generate analysis using Hugging Face models
  async generateAnalysis(type, originalText, changedText) {
    console.log('🚀 generateAnalysis called with type:', type);
    console.log('🔧 isConfigured():', this.isConfigured());
    
    if (!this.isConfigured()) {
      console.log('❌ API not configured, throwing error');
      throw new Error('Hugging Face API not configured. Please set up your API token.');
    }

    console.log('✅ API configured, proceeding with analysis...');
    try {
      let analysis;
      switch (type) {
        case 'explain':
          console.log('📝 Generating explanation...');
          analysis = await this.generateExplanation(originalText, changedText);
          break;
        case 'rewrite':
          console.log('✨ Generating rewrite suggestions...');
          analysis = await this.generateRewriteSuggestions(originalText, changedText);
          break;
        case 'summary':
          console.log('📄 Generating summary...');
          analysis = await this.generateSummary(originalText, changedText);
          break;
        case 'tone':
          console.log('🎭 Generating tone analysis...');
          analysis = await this.generateToneAnalysis(originalText, changedText);
          break;
        case 'cleanup':
          console.log('🧹 Generating cleanup analysis...');
          analysis = await this.generateCleanupAnalysis(originalText, changedText);
          break;
        default:
          console.log('📝 Generating default explanation...');
          analysis = await this.generateExplanation(originalText, changedText);
      }
      
      console.log('✅ Analysis generated successfully');
      return this.formatResponse(type, analysis);
    } catch (error) {
      console.error('❌ Hugging Face API Error:', error);
      throw new Error(`Failed to generate ${type} analysis: ${error.message}`);
    }
  }

  // Generate local analysis without API (fallback methods)
  async generateLocalAnalysis(type, originalText, changedText) {
    try {
      let analysis;
      switch (type) {
        case 'explain':
          analysis = this.getFallbackExplanation(originalText, changedText);
          break;
        case 'rewrite':
          analysis = this.getFallbackRewrite();
          break;
        case 'summary':
          analysis = this.getFallbackSummary(originalText, changedText);
          break;
        case 'tone':
          analysis = this.getFallbackToneAnalysis();
          break;
        case 'cleanup':
          analysis = this.generateCleanupAnalysis(originalText, changedText);
          break;
        default:
          analysis = this.getFallbackExplanation(originalText, changedText);
      }
      
      return this.formatResponse(type, analysis);
    } catch (error) {
      console.error('Local Analysis Error:', error);
      throw new Error(`Failed to generate local ${type} analysis: ${error.message}`);
    }
  }

  // Call Hugging Face Inference API
  async callHuggingFaceAPI(modelName, payload) {
    const url = `${this.config.baseUrl}/${modelName}`;
    console.log('🌐 Making Hugging Face API call to:', url);
    console.log('🔑 Using API key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'NONE');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const requestBody = {
      ...payload,
      options: {
        wait_for_model: this.config.waitForModel,
        use_cache: true
      }
    };
    
    console.log('📤 Full request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error Response:', error);
      throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ API Success Response:', result);
    return result;
  }

  // Generate text using text generation model
  async generateText(prompt, maxLength = 500) {
    console.log('🎯 generateText called with:', {
      model: this.config.models.textGeneration,
      promptLength: prompt.length,
      maxLength: maxLength
    });
    
    try {
      // Try primary model first
      const result = await this.callHuggingFaceAPI(this.config.models.textGeneration, {
        inputs: prompt,
        parameters: {
          max_length: maxLength,
          temperature: this.config.temperature,
          do_sample: true,
          top_p: 0.9,
          pad_token_id: 50256
        }
      });

      const generatedText = result[0]?.generated_text || '';
      console.log('📝 Generated text length:', generatedText.length);
      return generatedText;
    } catch (error) {
      console.log('⚠️ Primary model failed, trying fallback model...');
      try {
        // Try fallback model
        const result = await this.callHuggingFaceAPI(this.config.models.textGenerationFallback, {
          inputs: prompt,
          parameters: {
            max_length: maxLength,
            temperature: this.config.temperature,
            do_sample: true,
            top_p: 0.9
          }
        });

        const generatedText = result[0]?.generated_text || '';
        console.log('📝 Fallback generated text length:', generatedText.length);
        return generatedText;
      } catch (fallbackError) {
        console.error('❌ Both models failed:', fallbackError);
        throw new Error(`Text generation failed: ${fallbackError.message}`);
      }
    }
  }

  // Generate explanation analysis
  async generateExplanation(originalText, changedText) {
    console.log('🚀 Starting Hugging Face API explanation generation...');
    const stats = this.calculateTextStats(originalText, changedText);
    
    // Create a shorter, more focused prompt for better results
    const prompt = `Compare these texts and explain the key differences:

Text 1: "${originalText.substring(0, 150)}${originalText.length > 150 ? '...' : ''}"
Text 2: "${changedText.substring(0, 150)}${changedText.length > 150 ? '...' : ''}"

Analysis:`;

    try {
      console.log('📝 Calling Hugging Face API with prompt:', prompt.substring(0, 100) + '...');
      const aiInsight = await this.generateText(prompt, 200);
      console.log('✅ Hugging Face API response received:', aiInsight.substring(0, 100) + '...');
      
      // Clean up the AI response by removing the original prompt
      let cleanedInsight = aiInsight;
      if (aiInsight.includes(prompt)) {
        cleanedInsight = aiInsight.replace(prompt, '').trim();
      }
      
      // If the response is too short or empty, provide a basic analysis
      if (!cleanedInsight || cleanedInsight.length < 10) {
        cleanedInsight = "The AI analysis shows differences in content structure and word usage between the two text versions.";
      }
      
      return `
        <div class="ai-explanation">
          <h4>📊 Hugging Face AI Text Analysis</h4>
          <div class="analysis-stats">
            <div class="stat-item">
              <strong>Original Text:</strong> ${stats.originalLines} lines, ${stats.originalWords} words, ${stats.originalChars} characters
            </div>
            <div class="stat-item">
              <strong>Changed Text:</strong> ${stats.changedLines} lines, ${stats.changedWords} words, ${stats.changedChars} characters
            </div>
            <div class="stat-item">
              <strong>Difference:</strong> ${Math.abs(stats.changedLines - stats.originalLines)} lines, ${Math.abs(stats.changedWords - stats.originalWords)} words, ${Math.abs(stats.changedChars - stats.originalChars)} characters
            </div>
          </div>
          
          <h4>🤖 AI Insights from Hugging Face</h4>
          <div class="ai-insight">
            ${cleanedInsight}
          </div>
          
          <h4>🔍 Key Changes Detected</h4>
          <ul>
            ${stats.originalLines !== stats.changedLines ? `<li>Line count changed from ${stats.originalLines} to ${stats.changedLines}</li>` : ''}
            ${stats.originalWords !== stats.changedWords ? `<li>Word count changed from ${stats.originalWords} to ${stats.changedWords}</li>` : ''}
            ${originalText === changedText ? '<li>No changes detected - texts are identical</li>' : ''}
            ${Math.abs(stats.changedChars - stats.originalChars) > stats.originalChars * 0.5 ? '<li>⚠️ Significant length change detected</li>' : ''}
          </ul>
        </div>
      `;
    } catch (error) {
      console.error('❌ Hugging Face API failed for explanation:', error);
      console.error('Full error details:', error.message, error.stack);
      throw error; // Re-throw to trigger fallback in App.js
    }
  }

  // Generate rewrite suggestions
  async generateRewriteSuggestions(originalText, changedText) {
    const combinedText = originalText + ' ' + changedText;
    const prompt = `Improve this text for better clarity and readability:

"${combinedText.substring(0, 200)}${combinedText.length > 200 ? '...' : ''}"

Suggestions:`;

    try {
      console.log('✨ Generating rewrite suggestions...');
      const suggestions = await this.generateText(prompt, 250);
      console.log('✅ Rewrite suggestions received');
      
      // Clean up the AI response
      let cleanedSuggestions = suggestions;
      if (suggestions.includes(prompt)) {
        cleanedSuggestions = suggestions.replace(prompt, '').trim();
      }
      
      // If the response is too short or empty, provide basic suggestions
      if (!cleanedSuggestions || cleanedSuggestions.length < 10) {
        cleanedSuggestions = "Consider improving sentence structure, using more precise vocabulary, and ensuring clear transitions between ideas.";
      }
      
      return `
        <div class="ai-rewrite">
          <h4>✨ Hugging Face AI Rewrite Suggestions</h4>
          <div class="ai-suggestions">
            ${cleanedSuggestions}
          </div>
          
          <h4>📝 General Improvements</h4>
          <ul>
            <li>Consider breaking long sentences into shorter, more readable ones</li>
            <li>Use active voice where possible for clearer communication</li>
            <li>Ensure consistent terminology throughout the text</li>
            <li>Remove redundant words and phrases</li>
            <li>Add transitional phrases for better flow</li>
          </ul>
        </div>
      `;
    } catch (error) {
      console.error('❌ Error generating rewrite suggestions:', error);
      throw error; // Let the main function handle fallback
    }
  }

  // Generate summary using summarization model
  async generateSummary(originalText, changedText) {
    const combinedText = originalText + '\n\n' + changedText;
    
    try {
      const result = await this.callHuggingFaceAPI(this.config.models.summarization, {
        inputs: combinedText,
        parameters: {
          max_length: 150,
          min_length: 30,
          do_sample: false
        }
      });

      const summary = result[0]?.summary_text || 'Unable to generate summary';
      
      return `
        <div class="ai-summary">
          <h4>📝 AI-Generated Summary</h4>
          <div class="summary-content">
            <p>${summary}</p>
          </div>
          
          <h4>📊 Text Overview</h4>
          <p>Combined text length: ${combinedText.length} characters</p>
          <p>Analysis includes both original and changed versions for comprehensive understanding.</p>
        </div>
      `;
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.getFallbackSummary(originalText, changedText);
    }
  }

  // Generate tone analysis using sentiment model
  async generateToneAnalysis(originalText, changedText) {
    try {
      const [originalSentiment, changedSentiment] = await Promise.all([
        this.analyzeSentiment(originalText),
        this.analyzeSentiment(changedText)
      ]);

      return `
        <div class="ai-tone">
          <h4>🎭 AI Tone Analysis</h4>
          
          <div class="tone-section">
            <h5>📊 Original Text Sentiment</h5>
            <div class="sentiment-result">
              <strong>Primary Sentiment:</strong> ${originalSentiment.label} (${(originalSentiment.score * 100).toFixed(1)}% confidence)
            </div>
          </div>
          
          ${changedText ? `
          <div class="tone-section">
            <h5>📊 Changed Text Sentiment</h5>
            <div class="sentiment-result">
              <strong>Primary Sentiment:</strong> ${changedSentiment.label} (${(changedSentiment.score * 100).toFixed(1)}% confidence)
            </div>
          </div>
          ` : ''}
          
          <div class="tone-section">
            <h5>💡 Tone Insights</h5>
            <ul>
              <li>Sentiment analysis powered by Hugging Face AI models</li>
              <li>Consider your target audience when choosing tone</li>
              <li>Maintain consistency throughout your document</li>
              ${originalSentiment.label !== changedSentiment.label ? '<li>⚠️ Tone shift detected between versions</li>' : ''}
            </ul>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error generating tone analysis:', error);
      return this.getFallbackToneAnalysis();
    }
  }

  // Analyze sentiment using Hugging Face sentiment model
  async analyzeSentiment(text) {
    if (!text.trim()) {
      return { label: 'NEUTRAL', score: 0.5 };
    }

    try {
      const result = await this.callHuggingFaceAPI(this.config.models.sentiment, {
        inputs: text.substring(0, 500) // Limit text length for API
      });

      const topResult = result[0] || { label: 'NEUTRAL', score: 0.5 };
      return topResult;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { label: 'NEUTRAL', score: 0.5 };
    }
  }

  // Generate cleanup analysis
  async generateCleanupAnalysis(originalText, changedText) {
    const issues = this.detectFormattingIssues(originalText + '\n' + changedText);
    
    return `
      <div class="ai-cleanup">
        <h4>🧹 Text Cleanup Analysis</h4>
        
        <div class="cleanup-section">
          <h5>🔍 Issues Detected</h5>
          ${issues.length > 0 ? `
            <ul>
              ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          ` : '<p>✅ No major formatting issues detected!</p>'}
        </div>
        
        <div class="cleanup-section">
          <h5>✨ Cleanup Recommendations</h5>
          <ul>
            <li>Remove trailing whitespace at line ends</li>
            <li>Standardize line break usage</li>
            <li>Fix inconsistent punctuation</li>
            <li>Normalize quotation marks</li>
            <li>Remove unnecessary special characters</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Helper methods
  calculateTextStats(originalText, changedText) {
    return {
      originalLines: originalText.split('\n').length,
      changedLines: changedText.split('\n').length,
      originalWords: originalText.split(/\s+/).filter(w => w.length > 0).length,
      changedWords: changedText.split(/\s+/).filter(w => w.length > 0).length,
      originalChars: originalText.length,
      changedChars: changedText.length
    };
  }

  detectFormattingIssues(text) {
    const issues = [];
    if (text.includes('  ')) issues.push('Multiple consecutive spaces found');
    if (text.includes('\n\n\n')) issues.push('Excessive line breaks detected');
    if (text.match(/[.]{2,}/)) issues.push('Multiple periods found');
    if (text.match(/[!]{2,}/)) issues.push('Multiple exclamation marks found');
    if (text.match(/[?]{2,}/)) issues.push('Multiple question marks found');
    return issues;
  }

  // Fallback methods for when API calls fail
  getFallbackExplanation(originalText, changedText) {
    const stats = this.calculateTextStats(originalText, changedText);
    const wordDiff = stats.changedWords - stats.originalWords;
    const lineDiff = stats.changedLines - stats.originalLines;
    const charDiff = stats.changedChars - stats.originalChars;
    
    return `
      <div class="ai-explanation">
        <h4>📊 Text Analysis (Local Processing)</h4>
        <div class="analysis-stats">
          <div class="stat-item">
            <strong>Original Text:</strong> ${stats.originalLines} lines, ${stats.originalWords} words, ${stats.originalChars} characters
          </div>
          <div class="stat-item">
            <strong>Changed Text:</strong> ${stats.changedLines} lines, ${stats.changedWords} words, ${stats.changedChars} characters
          </div>
          <div class="stat-item">
            <strong>Net Changes:</strong> ${lineDiff > 0 ? '+' : ''}${lineDiff} lines, ${wordDiff > 0 ? '+' : ''}${wordDiff} words, ${charDiff > 0 ? '+' : ''}${charDiff} characters
          </div>
        </div>
        
        <h4>🔍 Analysis Results</h4>
        <ul>
          ${originalText === changedText ? '<li>✅ No changes detected - texts are identical</li>' : ''}
          ${Math.abs(wordDiff) > 0 ? `<li>📝 Word count ${wordDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(wordDiff)} words</li>` : ''}
          ${Math.abs(lineDiff) > 0 ? `<li>📄 Line count ${lineDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(lineDiff)} lines</li>` : ''}
          ${Math.abs(charDiff) > stats.originalChars * 0.5 ? '<li>⚠️ Significant content change detected (>50% length change)</li>' : ''}
          ${Math.abs(charDiff) < stats.originalChars * 0.1 ? '<li>✨ Minor changes detected (<10% length change)</li>' : ''}
        </ul>
        
        <div class="ai-note">
          <p><em>Note: This is a local analysis. For AI-powered insights, please check your Hugging Face API configuration.</em></p>
        </div>
      </div>
    `;
  }

  getFallbackRewrite() {
    return `
      <div class="ai-rewrite">
        <h4>✨ Writing Improvement Suggestions (Local Analysis)</h4>
        <div class="rewrite-suggestions">
          <h5>📝 General Writing Tips</h5>
          <ul>
            <li><strong>Clarity:</strong> Use clear, concise language and avoid jargon</li>
            <li><strong>Structure:</strong> Break up long sentences into shorter, more readable ones</li>
            <li><strong>Voice:</strong> Use active voice when possible for stronger impact</li>
            <li><strong>Consistency:</strong> Maintain consistent terminology and tone throughout</li>
            <li><strong>Grammar:</strong> Check for spelling, grammar, and punctuation errors</li>
          </ul>
          
          <h5>🎯 Content Enhancement</h5>
          <ul>
            <li>Remove redundant words and phrases</li>
            <li>Add transitional phrases for better flow</li>
            <li>Use specific examples to support your points</li>
            <li>Ensure each paragraph has a clear main idea</li>
          </ul>
        </div>
        
        <div class="ai-note">
          <p><em>Note: For AI-powered rewrite suggestions, please configure your Hugging Face API key.</em></p>
        </div>
      </div>
    `;
  }

  getFallbackSummary(originalText, changedText) {
    const stats = this.calculateTextStats(originalText, changedText);
    const combinedLength = originalText.length + changedText.length;
    const hasChanges = originalText !== changedText;
    
    return `
      <div class="ai-summary">
        <h4>📝 Text Summary (Local Analysis)</h4>
        <div class="summary-content">
          <p><strong>Document Overview:</strong> This comparison includes ${stats.originalWords + stats.changedWords} total words across both text versions.</p>
          
          ${hasChanges ? `
            <p><strong>Changes Detected:</strong> The text has been modified with ${Math.abs(stats.changedWords - stats.originalWords)} word difference and ${Math.abs(stats.changedLines - stats.originalLines)} line difference.</p>
          ` : `
            <p><strong>No Changes:</strong> Both text versions are identical.</p>
          `}
          
          <div class="summary-stats">
            <p><strong>Text Statistics:</strong></p>
            <ul>
              <li>Total characters: ${combinedLength}</li>
              <li>Original version: ${stats.originalWords} words, ${stats.originalLines} lines</li>
              <li>Changed version: ${stats.changedWords} words, ${stats.changedLines} lines</li>
            </ul>
          </div>
        </div>
        
        <div class="ai-note">
          <p><em>Note: For AI-generated summaries, please configure your Hugging Face API key.</em></p>
        </div>
      </div>
    `;
  }

  getFallbackToneAnalysis() {
    return `
      <div class="ai-tone">
        <h4>🎭 Tone Analysis Guidelines (Local Analysis)</h4>
        
        <div class="tone-section">
          <h5>📋 Manual Tone Assessment</h5>
          <p>Consider these aspects when evaluating your text's tone:</p>
          <ul>
            <li><strong>Formality Level:</strong> Is the language formal, informal, or conversational?</li>
            <li><strong>Emotional Tone:</strong> Does the text convey positive, negative, or neutral emotions?</li>
            <li><strong>Authority:</strong> Is the tone confident, uncertain, or questioning?</li>
            <li><strong>Audience Appropriateness:</strong> Does the tone match your intended audience?</li>
          </ul>
        </div>
        
        <div class="tone-section">
          <h5>💡 Tone Consistency Tips</h5>
          <ul>
            <li>Maintain consistent voice throughout your document</li>
            <li>Match tone to your purpose (informative, persuasive, entertaining)</li>
            <li>Consider cultural context and audience expectations</li>
            <li>Use appropriate vocabulary for your target readers</li>
            <li>Balance professionalism with accessibility</li>
          </ul>
        </div>
        
        <div class="ai-note">
          <p><em>Note: For AI-powered sentiment analysis, please configure your Hugging Face API key.</em></p>
        </div>
      </div>
    `;
  }

  // Format the response into the expected structure
  formatResponse(type, content) {
    const typeIcons = {
      explain: '🧠',
      rewrite: '✨',
      summary: '📝',
      tone: '🎭',
      cleanup: '🧹'
    };

    const typeTitles = {
      explain: 'Hugging Face AI Explanation',
      rewrite: 'Hugging Face AI Rewrite Suggestions',
      summary: 'Hugging Face AI Summary',
      tone: 'Hugging Face AI Tone Analysis',
      cleanup: 'Hugging Face AI Text Cleanup'
    };

    return {
      title: `${typeIcons[type] || '🤖'} ${typeTitles[type] || 'Hugging Face AI Analysis'}`,
      content: content,
      type: type
    };
  }

  // Test the Hugging Face connection
  async testConnection() {
    console.log('Testing Hugging Face connection...');
    console.log('API Key configured:', this.isConfigured());
    console.log('API Key preview:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'none');
    
    if (!this.isConfigured()) {
      return { success: false, error: 'API key not configured' };
    }
    
    try {
      // Use a simpler model for testing
      const result = await this.callHuggingFaceAPI('gpt2', {
        inputs: "Hello world",
        parameters: { max_length: 20 }
      });
      console.log('API test result:', result);
      return { success: true, response: 'Connection successful!', data: result };
    } catch (error) {
      console.error('API test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Debug method to check configuration
  debugConfig() {
    console.log('=== Hugging Face Debug Info ===');
    console.log('Environment API Key:', process.env.REACT_APP_HUGGINGFACE_API_KEY ? 'Found' : 'Not found');
    console.log('Config API Key:', this.config.apiKey ? 'Found' : 'Not found');
    console.log('API Key length:', this.config.apiKey ? this.config.apiKey.length : 0);
    console.log('Is Configured:', this.isConfigured());
    console.log('Base URL:', this.config.baseUrl);
    console.log('Models:', this.config.models);
    console.log('==============================');
  }

  // Get available models
  getAvailableModels() {
    return {
      textGeneration: [
        'meta-llama/Llama-2-7b-chat-hf',
        'microsoft/DialoGPT-large',
        'EleutherAI/gpt-neo-2.7B',
        'mistralai/Mistral-7B-Instruct-v0.1',
        'EleutherAI/gpt-neo-1.3B'
      ],
      summarization: [
        'facebook/bart-large-cnn',
        'google/pegasus-xsum',
        't5-base',
        't5-small'
      ],
      sentiment: [
        'cardiffnlp/twitter-roberta-base-sentiment-latest',
        'nlptown/bert-base-multilingual-uncased-sentiment',
        'distilbert-base-uncased-finetuned-sst-2-english'
      ]
    };
  }
}