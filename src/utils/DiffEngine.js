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
    
    const wordDiff = this.computeImprovedWordDiff(originalWords, changedWords);
    
    const stats = {
      wordsAdded: 0,
      wordsRemoved: 0,
      wordsModified: 0,
      totalChanges: 0
    };
    
    let originalHtml = '';
    let changedHtml = '';
    
    // Process original words with better counting
    wordDiff.original.forEach(item => {
      if (item.type === 'removed') {
        // Only count actual words, not whitespace
        if (item.content.trim() && /\S/.test(item.content)) {
          stats.wordsRemoved++;
        }
        originalHtml += `<span class="word-removed">${this.escapeHtml(item.content)}</span>`;
      } else if (item.type === 'modified') {
        if (item.content.trim() && /\S/.test(item.content)) {
          stats.wordsModified++;
        }
        originalHtml += `<span class="word-modified">${this.escapeHtml(item.content)}</span>`;
      } else {
        originalHtml += this.escapeHtml(item.content);
      }
    });
    
    // Process changed words with better counting
    wordDiff.changed.forEach(item => {
      if (item.type === 'added') {
        // Only count actual words, not whitespace
        if (item.content.trim() && /\S/.test(item.content)) {
          stats.wordsAdded++;
        }
        changedHtml += `<span class="word-added">${this.escapeHtml(item.content)}</span>`;
      } else if (item.type === 'modified') {
        if (item.content.trim() && /\S/.test(item.content)) {
          // Don't double count modified words
        }
        changedHtml += `<span class="word-modified">${this.escapeHtml(item.content)}</span>`;
      } else {
        changedHtml += this.escapeHtml(item.content);
      }
    });
    
    // Calculate total changes more accurately
    stats.totalChanges = stats.wordsAdded + stats.wordsRemoved + stats.wordsModified;
    
    return {
      originalLines: [{ content: originalHtml, type: '', lineNumber: 1 }],
      changedLines: [{ content: changedHtml, type: '', lineNumber: 1 }],
      stats
    };
  }

  performCharComparison(originalText, changedText) {
    const charDiff = this.computeImprovedCharDiff(originalText, changedText);
    
    const stats = {
      charactersAdded: 0,
      charactersRemoved: 0,
      charactersModified: 0,
      totalChanges: 0
    };
    
    let originalHtml = '';
    let changedHtml = '';
    
    // Process original characters with grouping for better visualization
    charDiff.original.forEach(item => {
      if (item.type === 'removed') {
        stats.charactersRemoved++;
        originalHtml += `<span class="char-removed">${this.escapeHtml(item.content)}</span>`;
      } else if (item.type === 'modified') {
        stats.charactersModified++;
        originalHtml += `<span class="char-modified">${this.escapeHtml(item.content)}</span>`;
      } else {
        originalHtml += this.escapeHtml(item.content);
      }
    });
    
    // Process changed characters with grouping
    charDiff.changed.forEach(item => {
      if (item.type === 'added') {
        stats.charactersAdded++;
        changedHtml += `<span class="char-added">${this.escapeHtml(item.content)}</span>`;
      } else if (item.type === 'modified') {
        // Don't double count modified characters
        changedHtml += `<span class="char-modified">${this.escapeHtml(item.content)}</span>`;
      } else {
        changedHtml += this.escapeHtml(item.content);
      }
    });
    
    // Calculate total changes
    stats.totalChanges = stats.charactersAdded + stats.charactersRemoved + stats.charactersModified;
    
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

  computeImprovedWordDiff(originalWords, changedWords) {
    // Use Myers' algorithm for better diff performance
    const result = this.myersWordDiff(originalWords, changedWords);
    
    // Post-process to detect word modifications (similar words that changed)
    return this.detectWordModifications(result);
  }

  myersWordDiff(originalWords, changedWords) {
    const m = originalWords.length;
    const n = changedWords.length;
    const max = m + n;
    
    const v = Array(2 * max + 1).fill(0);
    const trace = [];
    
    for (let d = 0; d <= max; d++) {
      trace.push([...v]);
      
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
          x = v[k + 1 + max];
        } else {
          x = v[k - 1 + max] + 1;
        }
        
        let y = x - k;
        
        while (x < m && y < n && originalWords[x] === changedWords[y]) {
          x++;
          y++;
        }
        
        v[k + max] = x;
        
        if (x >= m && y >= n) {
          return this.buildWordPath(originalWords, changedWords, trace, d);
        }
      }
    }
    
    // Fallback to simple LCS if Myers fails
    return this.computeWordDiff(originalWords, changedWords);
  }

  buildWordPath(originalWords, changedWords, trace, d) {
    const result = { original: [], changed: [] };
    let x = originalWords.length;
    let y = changedWords.length;
    
    for (let depth = d; depth > 0; depth--) {
      const v = trace[depth];
      const k = x - y;
      const max = originalWords.length + changedWords.length;
      
      let prevK;
      if (k === -depth || (k !== depth && v[k - 1 + max] < v[k + 1 + max])) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }
      
      const prevX = v[prevK + max];
      const prevY = prevX - prevK;
      
      while (x > prevX && y > prevY) {
        result.original.unshift({ content: originalWords[x - 1], type: 'unchanged' });
        result.changed.unshift({ content: changedWords[y - 1], type: 'unchanged' });
        x--;
        y--;
      }
      
      if (depth > 0) {
        if (x > prevX) {
          result.original.unshift({ content: originalWords[x - 1], type: 'removed' });
          x--;
        } else {
          result.changed.unshift({ content: changedWords[y - 1], type: 'added' });
          y--;
        }
      }
    }
    
    return result;
  }

  detectWordModifications(diffResult) {
    // Look for patterns where a word was removed and another added nearby
    const original = [...diffResult.original];
    const changed = [...diffResult.changed];
    
    // Simple heuristic: if words are similar (edit distance < 3), mark as modified
    for (let i = 0; i < original.length; i++) {
      if (original[i].type === 'removed') {
        const removedWord = original[i].content.trim();
        
        // Look for similar added words
        for (let j = 0; j < changed.length; j++) {
          if (changed[j].type === 'added') {
            const addedWord = changed[j].content.trim();
            
            if (removedWord && addedWord && this.areWordsSimilar(removedWord, addedWord)) {
              original[i].type = 'modified';
              changed[j].type = 'modified';
              break;
            }
          }
        }
      }
    }
    
    return { original, changed };
  }

  areWordsSimilar(word1, word2) {
    // Simple similarity check - could be enhanced with Levenshtein distance
    if (word1.length === 0 || word2.length === 0) return false;
    if (Math.abs(word1.length - word2.length) > 3) return false;
    
    // Check if they share common prefix/suffix
    const minLen = Math.min(word1.length, word2.length);
    let commonChars = 0;
    
    for (let i = 0; i < minLen; i++) {
      if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
        commonChars++;
      }
    }
    
    return commonChars / minLen > 0.6; // 60% similarity threshold
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

  computeImprovedCharDiff(originalText, changedText) {
    // Use character-level Myers algorithm with grouping for better visualization
    const result = this.myersCharDiff(originalText, changedText);
    
    // Group consecutive changes for better readability
    return this.groupCharacterChanges(result);
  }

  myersCharDiff(originalText, changedText) {
    const originalChars = Array.from(originalText);
    const changedChars = Array.from(changedText);
    
    const m = originalChars.length;
    const n = changedChars.length;
    const max = m + n;
    
    if (max === 0) {
      return { original: [], changed: [] };
    }
    
    const v = Array(2 * max + 1).fill(0);
    const trace = [];
    
    for (let d = 0; d <= max; d++) {
      trace.push([...v]);
      
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
          x = v[k + 1 + max];
        } else {
          x = v[k - 1 + max] + 1;
        }
        
        let y = x - k;
        
        while (x < m && y < n && originalChars[x] === changedChars[y]) {
          x++;
          y++;
        }
        
        v[k + max] = x;
        
        if (x >= m && y >= n) {
          return this.buildCharPath(originalChars, changedChars, trace, d);
        }
      }
    }
    
    // Fallback to simple character diff
    return this.computeCharDiff(originalText, changedText);
  }

  buildCharPath(originalChars, changedChars, trace, d) {
    const result = { original: [], changed: [] };
    let x = originalChars.length;
    let y = changedChars.length;
    
    for (let depth = d; depth > 0; depth--) {
      const v = trace[depth];
      const k = x - y;
      const max = originalChars.length + changedChars.length;
      
      let prevK;
      if (k === -depth || (k !== depth && v[k - 1 + max] < v[k + 1 + max])) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }
      
      const prevX = v[prevK + max];
      const prevY = prevX - prevK;
      
      while (x > prevX && y > prevY) {
        result.original.unshift({ content: originalChars[x - 1], type: 'unchanged' });
        result.changed.unshift({ content: changedChars[y - 1], type: 'unchanged' });
        x--;
        y--;
      }
      
      if (depth > 0) {
        if (x > prevX) {
          result.original.unshift({ content: originalChars[x - 1], type: 'removed' });
          x--;
        } else {
          result.changed.unshift({ content: changedChars[y - 1], type: 'added' });
          y--;
        }
      }
    }
    
    return result;
  }

  groupCharacterChanges(diffResult) {
    // Group consecutive character changes for better visualization
    const groupedOriginal = this.groupConsecutiveChanges(diffResult.original);
    const groupedChanged = this.groupConsecutiveChanges(diffResult.changed);
    
    return { original: groupedOriginal, changed: groupedChanged };
  }

  groupConsecutiveChanges(items) {
    if (!items || items.length === 0) return [];
    
    const grouped = [];
    let currentGroup = null;
    
    for (const item of items) {
      if (currentGroup && currentGroup.type === item.type && item.type !== 'unchanged') {
        // Continue the current group
        currentGroup.content += item.content;
      } else {
        // Start a new group
        if (currentGroup) {
          grouped.push(currentGroup);
        }
        currentGroup = { ...item };
      }
    }
    
    if (currentGroup) {
      grouped.push(currentGroup);
    }
    
    return grouped;
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