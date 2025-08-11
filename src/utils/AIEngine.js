export class AIEngine {
  generateAnalysis(type, originalText, changedText) {
    switch (type) {
      case 'explain':
        return this.generateExplanation(originalText, changedText);
      case 'rewrite':
        return this.generateRewrite(originalText, changedText);
      case 'summary':
        return this.generateSummary(originalText, changedText);
      case 'tone':
        return this.generateToneAnalysis(originalText, changedText);
      case 'cleanup':
        return this.generateCleanup(originalText, changedText);
      default:
        return this.generateExplanation(originalText, changedText);
    }
  }

  generateExplanation(originalText, changedText) {
    const originalLines = originalText.split('\n').length;
    const changedLines = changedText.split('\n').length;
    const originalWords = originalText.split(/\s+/).filter(w => w.length > 0).length;
    const changedWords = changedText.split(/\s+/).filter(w => w.length > 0).length;
    
    const content = `
      <div class="ai-explanation">
        <h4>📊 Text Analysis</h4>
        <div class="analysis-stats">
          <div class="stat-item">
            <strong>Original Text:</strong> ${originalLines} lines, ${originalWords} words, ${originalText.length} characters
          </div>
          <div class="stat-item">
            <strong>Changed Text:</strong> ${changedLines} lines, ${changedWords} words, ${changedText.length} characters
          </div>
          <div class="stat-item">
            <strong>Difference:</strong> ${Math.abs(changedLines - originalLines)} lines, ${Math.abs(changedWords - originalWords)} words, ${Math.abs(changedText.length - originalText.length)} characters
          </div>
        </div>
        
        <h4>🔍 Key Changes Detected</h4>
        <ul>
          ${originalLines !== changedLines ? `<li>Line count changed from ${originalLines} to ${changedLines}</li>` : ''}
          ${originalWords !== changedWords ? `<li>Word count changed from ${originalWords} to ${changedWords}</li>` : ''}
          ${originalText.length !== changedText.length ? `<li>Character count changed from ${originalText.length} to ${changedText.length}</li>` : ''}
          ${originalText === changedText ? '<li>No changes detected - texts are identical</li>' : ''}
        </ul>
        
        <h4>💡 Recommendations</h4>
        <ul>
          <li>Review highlighted differences in the comparison view</li>
          <li>Check for formatting consistency between versions</li>
          <li>Verify that important content hasn't been accidentally removed</li>
          ${Math.abs(changedText.length - originalText.length) > originalText.length * 0.5 ? '<li>⚠️ Significant length change detected - review carefully</li>' : ''}
        </ul>
      </div>
    `;
    
    return {
      title: '🧠 AI Explanation',
      content,
      type: 'explanation'
    };
  }

  generateRewrite(originalText, changedText) {
    const content = `
      <div class="ai-rewrite">
        <h4>✨ Rewrite Suggestions</h4>
        
        <div class="suggestion-section">
          <h5>📝 Style Improvements</h5>
          <ul>
            <li>Consider breaking long sentences into shorter, more readable ones</li>
            <li>Use active voice where possible for clearer communication</li>
            <li>Ensure consistent terminology throughout the text</li>
            <li>Remove redundant words and phrases</li>
          </ul>
        </div>
        
        <div class="suggestion-section">
          <h5>🎯 Clarity Enhancements</h5>
          <ul>
            <li>Add transitional phrases to improve flow</li>
            <li>Define technical terms or acronyms on first use</li>
            <li>Use bullet points or numbered lists for complex information</li>
            <li>Ensure each paragraph has a clear main idea</li>
          </ul>
        </div>
        
        <div class="suggestion-section">
          <h5>🔧 Structure Recommendations</h5>
          <ul>
            <li>Start with a clear introduction or summary</li>
            <li>Organize content in logical order</li>
            <li>Use headings and subheadings for better navigation</li>
            <li>End with a conclusion or call to action</li>
          </ul>
        </div>
      </div>
    `;
    
    return {
      title: '✨ AI Rewrite Suggestions',
      content,
      type: 'rewrite'
    };
  }

  generateSummary(originalText, changedText) {
    const combinedText = originalText + '\n\n' + changedText;
    const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keyPoints = sentences.slice(0, 3).map(s => s.trim());
    
    const content = `
      <div class="ai-summary">
        <h4>📝 Text Summary</h4>
        
        <div class="summary-section">
          <h5>🎯 Key Points</h5>
          <ul>
            ${keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
        
        <div class="summary-section">
          <h5>📊 Overview</h5>
          <p>The text contains ${sentences.length} main sentences covering various topics. 
          ${originalText && changedText ? 'Both original and changed versions have been analyzed.' : 'Single text version analyzed.'}</p>
        </div>
        
        <div class="summary-section">
          <h5>🔍 Main Themes</h5>
          <ul>
            <li>Primary content focus and structure</li>
            <li>Key information and data points</li>
            <li>Important conclusions or recommendations</li>
          </ul>
        </div>
      </div>
    `;
    
    return {
      title: '📝 AI Summary',
      content,
      type: 'summary'
    };
  }

  generateToneAnalysis(originalText, changedText) {
    const analyzeText = (text) => {
      const words = text.toLowerCase().split(/\s+/);
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'achieve', 'improve'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'fail', 'problem', 'issue', 'error', 'wrong'];
      const formalWords = ['therefore', 'furthermore', 'consequently', 'however', 'nevertheless', 'accordingly'];
      
      const positiveCount = words.filter(w => positiveWords.includes(w)).length;
      const negativeCount = words.filter(w => negativeWords.includes(w)).length;
      const formalCount = words.filter(w => formalWords.includes(w)).length;
      
      return { positiveCount, negativeCount, formalCount, totalWords: words.length };
    };
    
    const originalAnalysis = analyzeText(originalText);
    const changedAnalysis = analyzeText(changedText);
    
    const content = `
      <div class="ai-tone">
        <h4>🎭 Tone Analysis</h4>
        
        <div class="tone-section">
          <h5>📊 Original Text Tone</h5>
          <ul>
            <li><strong>Sentiment:</strong> ${originalAnalysis.positiveCount > originalAnalysis.negativeCount ? 'Positive' : originalAnalysis.negativeCount > originalAnalysis.positiveCount ? 'Negative' : 'Neutral'}</li>
            <li><strong>Formality:</strong> ${originalAnalysis.formalCount > 2 ? 'Formal' : 'Informal'}</li>
            <li><strong>Positive indicators:</strong> ${originalAnalysis.positiveCount} words</li>
            <li><strong>Negative indicators:</strong> ${originalAnalysis.negativeCount} words</li>
          </ul>
        </div>
        
        ${changedText ? `
        <div class="tone-section">
          <h5>📊 Changed Text Tone</h5>
          <ul>
            <li><strong>Sentiment:</strong> ${changedAnalysis.positiveCount > changedAnalysis.negativeCount ? 'Positive' : changedAnalysis.negativeCount > changedAnalysis.positiveCount ? 'Negative' : 'Neutral'}</li>
            <li><strong>Formality:</strong> ${changedAnalysis.formalCount > 2 ? 'Formal' : 'Informal'}</li>
            <li><strong>Positive indicators:</strong> ${changedAnalysis.positiveCount} words</li>
            <li><strong>Negative indicators:</strong> ${changedAnalysis.negativeCount} words</li>
          </ul>
        </div>
        ` : ''}
        
        <div class="tone-section">
          <h5>💡 Tone Recommendations</h5>
          <ul>
            <li>Maintain consistent tone throughout the document</li>
            <li>Consider your target audience when choosing formality level</li>
            <li>Balance positive and negative language appropriately</li>
            <li>Use active voice for more engaging tone</li>
          </ul>
        </div>
      </div>
    `;
    
    return {
      title: '🎭 AI Tone Analysis',
      content,
      type: 'tone'
    };
  }

  generateCleanup(originalText, changedText) {
    const cleanupSuggestions = [];
    
    // Check for common issues
    if (originalText.includes('  ')) cleanupSuggestions.push('Remove extra spaces');
    if (originalText.includes('\n\n\n')) cleanupSuggestions.push('Reduce excessive line breaks');
    if (originalText.match(/[.]{2,}/)) cleanupSuggestions.push('Fix multiple periods');
    if (originalText.match(/[!]{2,}/)) cleanupSuggestions.push('Fix multiple exclamation marks');
    if (originalText.match(/[?]{2,}/)) cleanupSuggestions.push('Fix multiple question marks');
    
    const content = `
      <div class="ai-cleanup">
        <h4>🧹 Text Cleanup Analysis</h4>
        
        <div class="cleanup-section">
          <h5>🔍 Issues Detected</h5>
          ${cleanupSuggestions.length > 0 ? `
            <ul>
              ${cleanupSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
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
        
        <div class="cleanup-section">
          <h5>🎯 Best Practices</h5>
          <ul>
            <li>Use single spaces between words</li>
            <li>Use single line breaks between paragraphs</li>
            <li>Be consistent with punctuation style</li>
            <li>Remove empty lines at document start/end</li>
          </ul>
        </div>
      </div>
    `;
    
    return {
      title: '🧹 AI Text Cleanup',
      content,
      type: 'cleanup'
    };
  }
}