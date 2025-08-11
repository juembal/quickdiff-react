export class DiffEngine {
  performComparison(originalText, changedText, settings) {
    const { diffMode, ignoreCase, ignoreWhitespace, ignorePunctuation } = settings;
    
    // Preprocess texts based on ignore options
    const processedOriginal = this.preprocessText(originalText, { ignoreCase, ignoreWhitespace, ignorePunctuation });
    const processedChanged = this.preprocessText(changedText, { ignoreCase, ignoreWhitespace, ignorePunctuation });
    
    switch (diffMode) {
      case 'word':
        return this.performWordComparison(processedOriginal, processedChanged);
      case 'char':
        return this.performCharComparison(processedOriginal, processedChanged);
      default:
        return this.performLineComparison(processedOriginal, processedChanged);
    }
  }

  preprocessText(text, options) {
    let processed = text;
    
    if (options.ignoreCase) {
      processed = processed.toLowerCase();
    }
    
    if (options.ignoreWhitespace) {
      processed = processed.replace(/\s+/g, ' ').trim();
    }
    
    if (options.ignorePunctuation) {
      processed = processed.replace(/[^\w\s]/g, '');
    }
    
    return processed;
  }

  performLineComparison(originalText, changedText) {
    const originalLines = originalText.split(/\r?\n/);
    const changedLines = changedText.split(/\r?\n/);
    
    const diff = this.computeLineDiff(originalLines, changedLines);
    
    const stats = {
      linesAdded: 0,
      linesRemoved: 0,
      linesModified: 0
    };
    
    const originalResult = [];
    const changedResult = [];
    
    // Process original lines
    diff.original.forEach((lineInfo, index) => {
      const lineObj = {
        content: this.escapeHtml(lineInfo.content),
        type: lineInfo.type,
        lineNumber: index + 1
      };
      
      if (lineInfo.type === 'removed') stats.linesRemoved++;
      if (lineInfo.type === 'modified') stats.linesModified++;
      
      originalResult.push(lineObj);
    });
    
    // Process changed lines
    diff.changed.forEach((lineInfo, index) => {
      const lineObj = {
        content: this.escapeHtml(lineInfo.content),
        type: lineInfo.type,
        lineNumber: index + 1
      };
      
      if (lineInfo.type === 'added') stats.linesAdded++;
      
      changedResult.push(lineObj);
    });
    
    return {
      originalLines: originalResult,
      changedLines: changedResult,
      stats
    };
  }

  performWordComparison(originalText, changedText) {
    const originalWords = this.splitIntoWords(originalText);
    const changedWords = this.splitIntoWords(changedText);
    
    const wordDiff = this.computeWordDiff(originalWords, changedWords);
    
    const stats = {
      wordsAdded: 0,
      wordsRemoved: 0
    };
    
    let originalHtml = '';
    let changedHtml = '';
    
    // Process original words
    wordDiff.original.forEach(item => {
      if (item.type === 'removed') {
        if (item.content.trim()) stats.wordsRemoved++;
        originalHtml += `<span class="word-removed">${this.escapeHtml(item.content)}</span>`;
      } else {
        originalHtml += this.escapeHtml(item.content);
      }
    });
    
    // Process changed words
    wordDiff.changed.forEach(item => {
      if (item.type === 'added') {
        if (item.content.trim()) stats.wordsAdded++;
        changedHtml += `<span class="word-added">${this.escapeHtml(item.content)}</span>`;
      } else {
        changedHtml += this.escapeHtml(item.content);
      }
    });
    
    return {
      originalLines: [{ content: originalHtml, type: '', lineNumber: 1 }],
      changedLines: [{ content: changedHtml, type: '', lineNumber: 1 }],
      stats
    };
  }

  performCharComparison(originalText, changedText) {
    const charDiff = this.computeCharDiff(originalText, changedText);
    
    const stats = {
      charactersAdded: 0,
      charactersRemoved: 0
    };
    
    let originalHtml = '';
    let changedHtml = '';
    
    charDiff.original.forEach(item => {
      if (item.type === 'removed') {
        stats.charactersRemoved++;
        originalHtml += `<span class="char-removed">${this.escapeHtml(item.content)}</span>`;
      } else {
        originalHtml += this.escapeHtml(item.content);
      }
    });
    
    charDiff.changed.forEach(item => {
      if (item.type === 'added') {
        stats.charactersAdded++;
        changedHtml += `<span class="char-added">${this.escapeHtml(item.content)}</span>`;
      } else {
        changedHtml += this.escapeHtml(item.content);
      }
    });
    
    return {
      originalLines: [{ content: originalHtml, type: '', lineNumber: 1 }],
      changedLines: [{ content: changedHtml, type: '', lineNumber: 1 }],
      stats
    };
  }

  computeLineDiff(originalLines, changedLines) {
    const m = originalLines.length;
    const n = changedLines.length;
    
    // Create DP table for LCS
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Fill the DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (originalLines[i - 1] === changedLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to build the diff
    const result = { original: [], changed: [] };
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === changedLines[j - 1]) {
        result.original.unshift({
          content: originalLines[i - 1],
          type: 'unchanged'
        });
        result.changed.unshift({
          content: changedLines[j - 1],
          type: 'unchanged'
        });
        i--; j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        result.original.unshift({
          content: originalLines[i - 1],
          type: 'removed'
        });
        i--;
      } else {
        result.changed.unshift({
          content: changedLines[j - 1],
          type: 'added'
        });
        j--;
      }
    }
    
    return result;
  }

  splitIntoWords(text) {
    const regex = /(\S+|\s+)/g;
    return text.match(regex) || [];
  }

  computeWordDiff(originalWords, changedWords) {
    const m = originalWords.length;
    const n = changedWords.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (originalWords[i - 1] === changedWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    const result = { original: [], changed: [] };
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalWords[i - 1] === changedWords[j - 1]) {
        result.original.unshift({ content: originalWords[i - 1], type: 'unchanged' });
        result.changed.unshift({ content: changedWords[j - 1], type: 'unchanged' });
        i--; j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        result.original.unshift({ content: originalWords[i - 1], type: 'removed' });
        i--;
      } else {
        result.changed.unshift({ content: changedWords[j - 1], type: 'added' });
        j--;
      }
    }
    
    return result;
  }

  computeCharDiff(originalText, changedText) {
    const originalChars = Array.from(originalText);
    const changedChars = Array.from(changedText);
    
    const m = originalChars.length;
    const n = changedChars.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (originalChars[i - 1] === changedChars[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    const result = { original: [], changed: [] };
    let i = m, j = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalChars[i - 1] === changedChars[j - 1]) {
        result.original.unshift({ content: originalChars[i - 1], type: 'unchanged' });
        result.changed.unshift({ content: changedChars[j - 1], type: 'unchanged' });
        i--; j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        result.original.unshift({ content: originalChars[i - 1], type: 'removed' });
        i--;
      } else {
        result.changed.unshift({ content: changedChars[j - 1], type: 'added' });
        j--;
      }
    }
    
    return result;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}