/**
 * Groq API Service for QuickDiff React App
 * Fast, reliable, and free AI API for text analysis
 * Get your free API key at: https://console.groq.com/
 */

export class GroqService {
  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_GROQ_API_KEY || '', // Groq API key from environment
      baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.1-8b-instant', // Fast and reliable model
      maxTokens: 1000,
      temperature: 0.7
    };
    
    this.loadConfig();
  }

  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('quickdiff_groq_config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        delete parsedConfig.apiKey; // Don't override API key from environment
        this.config = { ...this.config, ...parsedConfig };
      }
      
      // Ensure environment variable always takes precedence
      const envApiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (envApiKey) {
        this.config.apiKey = envApiKey;
      }
    } catch (error) {
      console.error('Error loading Groq config:', error);
    }
  }

  // Check if Groq is properly configured
  isConfigured() {
    const hasKey = this.config.apiKey && this.config.apiKey.trim().length > 0;
    const isValidKey = this.config.apiKey && this.config.apiKey.startsWith('gsk_');
    const configured = hasKey && isValidKey;
    
    console.log('🔍 Groq isConfigured check:', {
      envVar: process.env.REACT_APP_GROQ_API_KEY ? 'Found' : 'Not found',
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey ? this.config.apiKey.length : 0,
      apiKeyPreview: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'none',
      startsWithGsk: isValidKey,
      configured: configured
    });
    return configured;
  }

  // Call Groq API
  async callGroqAPI(messages) {
    console.log('🌐 Making Groq API call...');
    console.log('🔑 Using API key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'NONE');
    
    const response = await fetch(this.config.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Groq API Error Response:', error);
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Groq API Success');
    return result.choices[0].message.content;
  }

  // Generate analysis using Groq
  async generateAnalysis(type, originalText, changedText) {
    console.log('🚀 generateAnalysis called with type:', type);
    console.log('🔧 isConfigured():', this.isConfigured());
    
    if (!this.isConfigured()) {
      console.log('❌ Groq API not configured, throwing error');
      throw new Error('Groq API not configured. Please set up your API token.');
    }

    console.log('✅ Groq API configured, proceeding with analysis...');
    try {
      let analysis;
      switch (type) {
        case 'explain':
          analysis = await this.generateExplanation(originalText, changedText);
          break;
        case 'rewrite':
          analysis = await this.generateRewriteSuggestions(originalText, changedText);
          break;
        case 'summary':
          analysis = await this.generateSummary(originalText, changedText);
          break;
        case 'tone':
          analysis = await this.generateToneAnalysis(originalText, changedText);
          break;
        case 'cleanup':
          analysis = await this.generateCleanupAnalysis(originalText, changedText);
          break;
        default:
          analysis = await this.generateExplanation(originalText, changedText);
      }
      
      console.log('✅ Analysis generated successfully');
      return this.formatResponse(type, analysis);
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      throw new Error(`Failed to generate ${type} analysis: ${error.message}`);
    }
  }

  // Generate explanation analysis
  async generateExplanation(originalText, changedText) {
    console.log('📝 Generating explanation with Groq...');
    const stats = this.calculateTextStats(originalText, changedText);
    
    const messages = [
      {
        role: "system",
        content: "You are an expert text analyst. Analyze the differences between two texts and provide clear, insightful explanations."
      },
      {
        role: "user",
        content: `Compare these two texts and explain the key differences:

Original Text: "${originalText.substring(0, 300)}${originalText.length > 300 ? '...' : ''}"

Changed Text: "${changedText.substring(0, 300)}${changedText.length > 300 ? '...' : ''}"

Please provide a detailed analysis of the differences, changes in meaning, style, and content structure.`
      }
    ];

    try {
      const aiInsight = await this.callGroqAPI(messages);
      console.log('✅ Groq explanation received');
      
      return `
        <div class="ai-explanation">
          <div class="ai-header">
            <h4>📊 Groq AI Text Analysis</h4>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">📈 Text Statistics</h5>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Original Text</div>
                <div class="stat-value">${stats.originalLines} lines • ${stats.originalWords} words • ${stats.originalChars} chars</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Changed Text</div>
                <div class="stat-value">${stats.changedLines} lines • ${stats.changedWords} words • ${stats.changedChars} chars</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Net Changes</div>
                <div class="stat-value">
                  ${Math.abs(stats.changedLines - stats.originalLines)} lines • 
                  ${Math.abs(stats.changedWords - stats.originalWords)} words • 
                  ${Math.abs(stats.changedChars - stats.originalChars)} chars
                </div>
              </div>
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">🤖 AI Analysis</h5>
            <div class="ai-insight-box">
              ${this.formatAIResponse(aiInsight)}
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">🔍 Key Findings</h5>
            <div class="findings-list">
              ${stats.originalLines !== stats.changedLines ? `<div class="finding-item">📄 Line count: ${stats.originalLines} → ${stats.changedLines}</div>` : ''}
              ${stats.originalWords !== stats.changedWords ? `<div class="finding-item">📝 Word count: ${stats.originalWords} → ${stats.changedWords}</div>` : ''}
              ${originalText === changedText ? '<div class="finding-item">✅ No changes detected - texts are identical</div>' : ''}
              ${Math.abs(stats.changedChars - stats.originalChars) > stats.originalChars * 0.5 ? '<div class="finding-item">⚠️ Significant content change detected (>50%)</div>' : ''}
              ${Math.abs(stats.changedChars - stats.originalChars) < stats.originalChars * 0.1 ? '<div class="finding-item">✨ Minor changes detected (<10%)</div>' : ''}
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Groq API failed for explanation:', error);
      throw error;
    }
  }

  // Generate rewrite suggestions
  async generateRewriteSuggestions(originalText, changedText) {
    console.log('✨ Generating rewrite suggestions with Groq...');
    const combinedText = originalText + ' ' + changedText;
    
    const messages = [
      {
        role: "system",
        content: "You are an expert writing coach. Provide specific, actionable suggestions to improve text clarity, style, and readability."
      },
      {
        role: "user",
        content: `Please analyze this text and provide specific rewrite suggestions to improve clarity, style, and readability:

"${combinedText.substring(0, 400)}${combinedText.length > 400 ? '...' : ''}"

Provide concrete suggestions for improvement, including specific examples where possible.`
      }
    ];

    try {
      const suggestions = await this.callGroqAPI(messages);
      console.log('✅ Groq rewrite suggestions received');
      
      return `
        <div class="ai-rewrite">
          <div class="ai-header">
            <h4>✨ Groq AI Rewrite Suggestions</h4>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">🎯 AI-Generated Suggestions</h5>
            <div class="suggestions-box">
              ${this.formatAIResponse(suggestions)}
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">📝 Writing Best Practices</h5>
            <div class="tips-grid">
              <div class="tip-item">
                <div class="tip-icon">🎯</div>
                <div class="tip-content">
                  <strong>Clarity:</strong> Use clear, concise language and avoid jargon
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">📏</div>
                <div class="tip-content">
                  <strong>Structure:</strong> Break up long sentences for better readability
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">💪</div>
                <div class="tip-content">
                  <strong>Voice:</strong> Use active voice when possible
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🔄</div>
                <div class="tip-content">
                  <strong>Consistency:</strong> Ensure consistent terminology throughout
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🌊</div>
                <div class="tip-content">
                  <strong>Flow:</strong> Add transitional phrases for better flow
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Groq API failed for rewrite suggestions:', error);
      throw error;
    }
  }

  // Generate summary
  async generateSummary(originalText, changedText) {
    console.log('📄 Generating summary with Groq...');
    const combinedText = originalText + '\n\n' + changedText;
    
    const messages = [
      {
        role: "system",
        content: "You are an expert at creating concise, informative summaries. Focus on the key points and main ideas."
      },
      {
        role: "user",
        content: `Please provide a concise summary of these texts, highlighting the main points and any key differences:

"${combinedText.substring(0, 500)}${combinedText.length > 500 ? '...' : ''}"

Focus on the most important information and any significant changes between versions.`
      }
    ];

    try {
      const summary = await this.callGroqAPI(messages);
      console.log('✅ Groq summary received');
      
      return `
        <div class="ai-summary">
          <div class="ai-header">
            <h4>📝 Groq AI Summary</h4>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">📄 Key Points Summary</h5>
            <div class="summary-box">
              ${this.formatAIResponse(summary, 'summary')}
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">📊 Document Overview</h5>
            <div class="overview-stats">
              <div class="overview-item">
                <span class="overview-label">📏 Combined Length:</span>
                <span class="overview-value">${combinedText.length} characters</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">🔍 Analysis Scope:</span>
                <span class="overview-value">Both original and changed versions</span>
              </div>
              <div class="overview-item">
                <span class="overview-label">🎯 Focus:</span>
                <span class="overview-value">Main points and key differences</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Groq API failed for summary:', error);
      throw error;
    }
  }

  // Generate tone analysis
  async generateToneAnalysis(originalText, changedText) {
    console.log('🎭 Generating tone analysis with Groq...');
    
    const messages = [
      {
        role: "system",
        content: "You are an expert in linguistic analysis and tone assessment. Analyze the emotional tone, formality level, and overall sentiment of texts."
      },
      {
        role: "user",
        content: `Please analyze the tone and sentiment of these texts:

Original Text: "${originalText.substring(0, 300)}${originalText.length > 300 ? '...' : ''}"

Changed Text: "${changedText.substring(0, 300)}${changedText.length > 300 ? '...' : ''}"

Analyze: emotional tone, formality level, sentiment, audience appropriateness, and any tone shifts between versions.`
      }
    ];

    try {
      const toneAnalysis = await this.callGroqAPI(messages);
      console.log('✅ Groq tone analysis received');
      
      return `
        <div class="ai-tone">
          <div class="ai-header">
            <h4>🎭 Groq AI Tone Analysis</h4>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">🎯 Tone Assessment</h5>
            <div class="tone-analysis-box">
              ${this.formatAIResponse(toneAnalysis)}
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">💡 Tone Guidelines</h5>
            <div class="guidelines-grid">
              <div class="guideline-item">
                <div class="guideline-icon">🎯</div>
                <div class="guideline-content">
                  <strong>Consistency:</strong> Maintain consistent voice throughout your document
                </div>
              </div>
              <div class="guideline-item">
                <div class="guideline-icon">👥</div>
                <div class="guideline-content">
                  <strong>Audience:</strong> Match tone to your purpose and audience
                </div>
              </div>
              <div class="guideline-item">
                <div class="guideline-icon">🌍</div>
                <div class="guideline-content">
                  <strong>Context:</strong> Consider cultural context and expectations
                </div>
              </div>
              <div class="guideline-item">
                <div class="guideline-icon">⚖️</div>
                <div class="guideline-content">
                  <strong>Balance:</strong> Balance professionalism with accessibility
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Groq API failed for tone analysis:', error);
      throw error;
    }
  }

  // Generate cleanup analysis
  async generateCleanupAnalysis(originalText, changedText) {
    console.log('🧹 Generating cleanup analysis with Groq...');
    const combinedText = originalText + '\n' + changedText;
    
    const messages = [
      {
        role: "system",
        content: "You are an expert editor focused on text cleanup and formatting. Identify formatting issues, inconsistencies, and areas for improvement."
      },
      {
        role: "user",
        content: `Please analyze this text for formatting issues, inconsistencies, and cleanup opportunities:

"${combinedText.substring(0, 400)}${combinedText.length > 400 ? '...' : ''}"

Look for: spacing issues, punctuation problems, inconsistent formatting, redundant phrases, and other cleanup opportunities.`
      }
    ];

    try {
      const cleanupAnalysis = await this.callGroqAPI(messages);
      console.log('✅ Groq cleanup analysis received');
      
      return `
        <div class="ai-cleanup">
          <div class="ai-header">
            <h4>🧹 Groq AI Text Cleanup Analysis</h4>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">🔍 Issues & Recommendations</h5>
            <div class="cleanup-analysis-box">
              ${this.formatAIResponse(cleanupAnalysis)}
            </div>
          </div>
          
          <div class="ai-section">
            <h5 class="section-title">✨ Cleanup Checklist</h5>
            <div class="cleanup-checklist">
              <div class="cleanup-item">
                <div class="cleanup-icon">🔲</div>
                <div class="cleanup-content">Remove trailing whitespace at line ends</div>
              </div>
              <div class="cleanup-item">
                <div class="cleanup-icon">📏</div>
                <div class="cleanup-content">Standardize line break usage</div>
              </div>
              <div class="cleanup-item">
                <div class="cleanup-icon">📝</div>
                <div class="cleanup-content">Fix inconsistent punctuation</div>
              </div>
              <div class="cleanup-item">
                <div class="cleanup-icon">💬</div>
                <div class="cleanup-content">Normalize quotation marks</div>
              </div>
              <div class="cleanup-item">
                <div class="cleanup-icon">🧽</div>
                <div class="cleanup-content">Remove unnecessary special characters</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('❌ Groq API failed for cleanup analysis:', error);
      throw error;
    }
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

  // Format AI response - bullets for analysis, paragraphs for summaries
  formatAIResponse(text, type = 'default') {
    if (!text) return '';
    
    // Clean up the text
    let cleaned = text
      // Remove **text** and replace with <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Remove single asterisks
      .replace(/\*(.*?)\*/g, '$1')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Trim whitespace
      .trim();
    
    // For summaries, use paragraph format for better flow
    if (type === 'summary') {
      // Split into logical paragraphs
      const paragraphs = cleaned
        .split(/\n\s*\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 20); // Filter out very short fragments
      
      // If we have multiple paragraphs, format them nicely
      if (paragraphs.length > 1) {
        return paragraphs.map(paragraph => `<p style="margin-bottom: 16px; line-height: 1.6;">${paragraph}</p>`).join('');
      }
      // Single paragraph - split by sentences for better readability
      else {
        const sentences = cleaned.split(/(?<=\.)\s+(?=[A-Z])/).filter(s => s.trim().length > 10);
        if (sentences.length > 2) {
          // Group sentences into logical paragraphs (2-3 sentences each)
          const groupedParagraphs = [];
          for (let i = 0; i < sentences.length; i += 2) {
            const group = sentences.slice(i, i + 2).join(' ').trim();
            if (group) groupedParagraphs.push(group);
          }
          return groupedParagraphs.map(paragraph => `<p style="margin-bottom: 16px; line-height: 1.6;">${paragraph}</p>`).join('');
        }
        return `<p style="line-height: 1.6;">${cleaned}</p>`;
      }
    }
    
    // For other types (explain, rewrite, tone, cleanup), use bullet format
    let points = [];
    
    // First try to split by numbered items (1., 2., 3., etc.)
    if (cleaned.match(/\d+\.\s/)) {
      points = cleaned.split(/(?=\d+\.\s)/).filter(p => p.trim());
    }
    // If no numbered items, split by periods followed by capital letters or new sections
    else if (cleaned.match(/\.\s+[A-Z]/)) {
      points = cleaned.split(/\.\s+(?=[A-Z])/).map(p => p.trim() + (p.endsWith('.') ? '' : '.'));
    }
    // If no clear structure, split by double line breaks or long sentences
    else {
      points = cleaned.split(/\n\s*\n+|(?<=\.)\s+(?=[A-Z][^.]*:)/).filter(p => p.trim());
    }
    
    // Clean up and format each point
    const formattedPoints = points
      .map(point => point.trim())
      .filter(point => point.length > 10) // Filter out very short fragments
      .map(point => {
        // Remove leading numbers if present
        point = point.replace(/^\d+\.\s*/, '');
        // Ensure proper sentence ending
        if (!point.endsWith('.') && !point.endsWith('!') && !point.endsWith('?')) {
          point += '.';
        }
        return point;
      });
    
    // If we have multiple points, format as bulleted list
    if (formattedPoints.length > 1) {
      return `<ul style="line-height: 1.6; margin: 12px 0;">${formattedPoints.map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}</ul>`;
    }
    // If only one point or no clear structure, return as paragraph
    else {
      return `<p style="line-height: 1.6;">${cleaned}</p>`;
    }
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
      explain: 'Groq AI Explanation',
      rewrite: 'Groq AI Rewrite Suggestions',
      summary: 'Groq AI Summary',
      tone: 'Groq AI Tone Analysis',
      cleanup: 'Groq AI Text Cleanup'
    };

    return {
      title: `${typeIcons[type] || '🤖'} ${typeTitles[type] || 'Groq AI Analysis'}`,
      content: content,
      type: type
    };
  }

  // Test the Groq connection
  async testConnection() {
    console.log('Testing Groq connection...');
    console.log('API Key configured:', this.isConfigured());
    
    if (!this.isConfigured()) {
      return { success: false, error: 'API key not configured' };
    }
    
    try {
      const result = await this.callGroqAPI([
        { role: "user", content: "Say 'Hello, Groq API is working!' in a friendly way." }
      ]);
      console.log('API test result:', result);
      return { success: true, response: result };
    } catch (error) {
      console.error('API test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Debug method
  debugConfig() {
    console.log('=== Groq Debug Info ===');
    console.log('Environment API Key:', process.env.REACT_APP_GROQ_API_KEY ? 'Found' : 'Not found');
    console.log('Config API Key:', this.config.apiKey ? 'Found' : 'Not found');
    console.log('Is Configured:', this.isConfigured());
    console.log('Base URL:', this.config.baseUrl);
    console.log('Model:', this.config.model);
    console.log('======================');
  }
}