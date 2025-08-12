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
      
      // Create detailed structured analysis
      const originalPreview = originalText.length > 50 ? `"${originalText.substring(0, 50)}..."` : `"${originalText}"`;
      const changedPreview = changedText.length > 50 ? `"${changedText.substring(0, 50)}..."` : `"${changedText}"`;
      
      const analysis = `📊 **Text Analysis**

📝 **Content**

**Original:** ${originalPreview} ${originalText.length > 50 ? `— ${originalText.length} character text` : originalText.trim() === '' ? '— empty content' : originalText.length < 10 ? '— appears to be a short sequence' : ''}

**Changed:** ${changedPreview} ${changedText.length > 50 ? `— ${changedText.length} character text` : changedText.trim() === '' ? '— complete removal of content' : changedText.length < 10 ? '— appears to be a short sequence' : ''}

**Result:** ${originalText === changedText ? 'No content differences detected.' : stats.changedChars === 0 ? 'Complete content removal.' : Math.abs(stats.changedChars - stats.originalChars) > stats.originalChars * 0.5 ? 'Significant difference in content.' : 'Moderate content changes detected.'}

🧠 **Meaning**

${aiInsight}

🎨 **Style**

**Original:** ${originalText.trim() === '' ? 'No style — empty content' : originalText.length < 10 ? 'Minimal, informal text' : 'Standard text formatting'}

**Changed:** ${changedText.trim() === '' ? 'Minimalist — no content at all' : changedText.length < 10 ? 'Minimal, informal text' : 'Standard text formatting'}

**Result:** ${originalText === changedText ? 'No style changes detected.' : 'Style analysis shows formatting differences between versions.'}

🏗️ **Structure**

**Original:** ${stats.originalLines === 1 ? 'Single line structure' : `Multi-line structure (${stats.originalLines} lines)`}

**Changed:** ${stats.changedLines === 1 ? 'Single line structure' : stats.changedLines === 0 ? 'No structure — represents absence of content' : `Multi-line structure (${stats.changedLines} lines)`}

📋 **Summary**

The primary differences are in ${originalText === changedText ? 'formatting and presentation' : 'content and structure'}. ${originalText.trim() === '' && changedText.trim() === '' ? 'Both versions are empty.' : originalText.trim() === '' ? 'Content was added to an empty document.' : changedText.trim() === '' ? 'All content was removed from the original.' : 'Content modifications were made between versions.'}

📊 **Statistics**

**Original:** ${stats.originalLines} line${stats.originalLines !== 1 ? 's' : ''}, ${stats.originalWords} word${stats.originalWords !== 1 ? 's' : ''}, ${stats.originalChars} character${stats.originalChars !== 1 ? 's' : ''}

**Changed:** ${stats.changedLines} line${stats.changedLines !== 1 ? 's' : ''}, ${stats.changedWords} word${stats.changedWords !== 1 ? 's' : ''}, ${stats.changedChars} character${stats.changedChars !== 1 ? 's' : ''}

**Net Change:** ${Math.abs(stats.changedLines - stats.originalLines)} line${Math.abs(stats.changedLines - stats.originalLines) !== 1 ? 's' : ''}, ${Math.abs(stats.changedWords - stats.originalWords)} word${Math.abs(stats.changedWords - stats.originalWords) !== 1 ? 's' : ''}, ${Math.abs(stats.changedChars - stats.originalChars)} character${Math.abs(stats.changedChars - stats.originalChars) !== 1 ? 's' : ''} ${stats.changedChars > stats.originalChars ? 'added' : stats.changedChars < stats.originalChars ? 'removed' : 'unchanged'}

🔍 **Key Findings**

${stats.originalWords !== stats.changedWords ? `• 📝 Word count changed from **${stats.originalWords}** → **${stats.changedWords}**` : ''}
${stats.originalLines !== stats.changedLines ? `• 📄 Line count changed from **${stats.originalLines}** → **${stats.changedLines}**` : ''}
${originalText === changedText ? '• ✅ **No changes detected** — texts are identical' : ''}
${Math.abs(stats.changedChars - stats.originalChars) > stats.originalChars * 0.5 ? '• ⚠️ **Significant content change detected** (>50% length change)' : ''}
${Math.abs(stats.changedChars - stats.originalChars) < stats.originalChars * 0.1 && originalText !== changedText ? '• ✨ **Minor changes detected** (<10% length change)' : ''}`;

      return analysis;
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
      
      // Create clean rewrite suggestions like ChatGPT with bold and emojis
      const rewriteAnalysis = `✨ **Writing Improvement Suggestions**

${suggestions}

📝 **General Writing Tips:**
• 🎯 Use **clear, concise language** and avoid unnecessary jargon
• 📏 Break up **long sentences** into shorter, more readable ones
• 💪 Use **active voice** when possible for stronger impact
• 🔄 Ensure **consistent terminology** and tone throughout
• 🌊 Add **transitional phrases** to improve flow between ideas
• 🧹 Remove **redundant words** and phrases
• 📋 Use **specific examples** to support your points`;

      return rewriteAnalysis;
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
      
      // Create clean summary like ChatGPT with bold and emojis
      const summaryAnalysis = `📝 **Summary**

${summary}

📊 **Document Overview:**
• 📏 **Combined length:** ${combinedText.length} characters
• 🔍 **Analysis scope:** Both original and changed versions
• 🎯 **Focus:** Main points and key differences between versions
• ⚡ **Processing:** AI-powered analysis using advanced language models

💡 This summary captures the **most important information** and highlights **key changes** between the text versions.`;

      return summaryAnalysis;
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
      
      // Create clean tone analysis like ChatGPT with bold and emojis
      const toneAnalysisResult = `🎭 **Tone Analysis**

${toneAnalysis}

💡 **Tone Guidelines:**
• 🎯 Maintain **consistent voice** throughout your document
• 👥 Match tone to your **target audience** and purpose
• 🌡️ Consider the **emotional impact** of your word choices
• ⚖️ Balance **professionalism** with accessibility
• 🔄 Ensure tone shifts are **intentional** and serve a purpose
• 🌍 Consider **cultural context** and reader expectations

✨ **Remember:** Effective tone helps **convey your message clearly** and builds **connection** with your audience.`;

      return toneAnalysisResult;
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
      
      // Create clean cleanup analysis like ChatGPT with bold and emojis
      const cleanupResult = `🧹 **Text Cleanup Analysis**

${cleanupAnalysis}

✨ **Cleanup Checklist:**
• 🔲 Remove **trailing whitespace** at line ends
• 📏 Standardize **line break usage** throughout
• 📝 Fix **inconsistent punctuation** patterns
• 💬 Normalize **quotation marks** (straight vs. curly)
• 🧽 Remove **unnecessary special characters**
• 📐 Ensure **consistent spacing** around punctuation
• 🔍 Check for **double spaces** and extra line breaks

💡 These improvements will make your text **more professional** and **easier to read**.`;

      return cleanupResult;
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

  // Simple text cleaning for ChatGPT-style responses
  cleanAIText(text) {
    if (!text) return '';
    
    return text
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/\s+/g, ' ') // Clean up spaces
      .trim();
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