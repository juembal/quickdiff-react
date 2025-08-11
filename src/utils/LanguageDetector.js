/**
 * Enhanced Language Auto-Detection Utility
 * Detects programming language based on content patterns with improved accuracy
 */

export class LanguageDetector {
  constructor() {
    this.patterns = {
      javascript: {
        strong: [
          /\b(const|let|var)\s+\w+\s*=/,
          /\b(function|async\s+function)\s*\w*\s*\(/,
          /\b(React|useState|useEffect|useContext|props)\b/,
          /\b(console\.(log|error|warn))\s*\(/,
          /\b(document\.|window\.)\w+/,
          /\b(require|import|export)\s*\(/,
          /\bexport\s+(default\s+)?/,
          /=>\s*[{(]/,
          /\.(js|jsx|ts|tsx)$/i
        ],
        medium: [
          /\b(if|else|for|while|switch|case|break|continue|return)\b/,
          /\b(setTimeout|setInterval|Promise|async|await)\b/,
          /\b(null|undefined|NaN|Infinity)\b/,
          /\/\/.*$/m,
          /\/\*[\s\S]*?\*\//,
          /\b(true|false)\b/,
          /\$\{[^}]*\}/
        ],
        weak: [
          /\b(npm|node|express|axios|webpack)\b/,
          /\.(json|js)"/
        ]
      },
      python: {
        strong: [
          /\bdef\s+\w+\s*\(/,
          /\bclass\s+\w+\s*(\([^)]*\))?\s*:/,
          /\bfrom\s+\w+\s+import\b/,
          /\bimport\s+\w+/,
          /\b(if|elif|else)\s+.*:/,
          /\bfor\s+\w+\s+in\b/,
          /\bwhile\s+.*:/,
          /\b(try|except|finally)\s*:/,
          /\bwith\s+.*:/,
          /\.(py|pyw)$/i
        ],
        medium: [
          /\b(self|__init__|__name__|__main__)\b/,
          /\b(print|input|len|range|enumerate|zip)\b/,
          /\b(True|False|None)\b/,
          /\b(and|or|not|in|is)\b/,
          /#.*$/m,
          /"""[\s\S]*?"""/,
          /'''[\s\S]*?'''/
        ],
        weak: [
          /\bindent/,
          /\bpip\s+install\b/
        ]
      },
      java: {
        strong: [
          /\bpublic\s+class\s+\w+/,
          /\bpublic\s+static\s+void\s+main\s*\(/,
          /\b(public|private|protected)\s+(static\s+)?\w+\s+\w+\s*\(/,
          /\bSystem\.out\.(println|print)\s*\(/,
          /\b(extends|implements)\s+\w+/,
          /\.(java)$/i
        ],
        medium: [
          /\b(String|int|double|float|boolean|char|void|Object)\b/,
          /\b(if|else|for|while|switch|case|break|continue|return|try|catch|finally)\b/,
          /\b(public|private|protected|static|final|abstract)\b/,
          /\/\/.*$/m,
          /\/\*[\s\S]*?\*\//,
          /\bnew\s+\w+\s*\(/
        ],
        weak: [
          /\bimport\s+java\./,
          /\bpackage\s+\w+/
        ]
      },
      html: {
        strong: [
          /<!DOCTYPE\s+html>/i,
          /<html\b[^>]*>/i,
          /<(head|body|div|span|p|a|img|script|style|link|meta)\b[^>]*>/i,
          /\.(html|htm)$/i
        ],
        medium: [
          /<\/?[a-z][\s\S]*?>/i,
          /<!--[\s\S]*?-->/,
          /<\w+(\s+\w+(\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/
        ],
        weak: []
      },
      css: {
        strong: [
          /[.#]?[\w-]+\s*\{[^}]*\}/,
          /@(media|import|keyframes|font-face)\b/,
          /\.(css|scss|sass|less)$/i
        ],
        medium: [
          /\b(color|background|margin|padding|border|width|height|font|display|position|flex|grid)\s*:/,
          /#[a-fA-F0-9]{3,8}\b/,
          /\b\d+(px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex|ch)\b/,
          /\/\*[\s\S]*?\*\//,
          /rgba?\([^)]+\)/
        ],
        weak: [
          /\b(hover|focus|active|visited)\b/
        ]
      },
      json: {
        strong: [
          /^\s*\{[\s\S]*\}\s*$/,
          /^\s*\[[\s\S]*\]\s*$/,
          /"[^"]*"\s*:\s*("[^"]*"|\d+|true|false|null|\{|\[)/,
          /\.(json)$/i
        ],
        medium: [
          /^\s*[{[]/,
          /"[^"]*"\s*:/,
          /:\s*(true|false|null)\b/
        ],
        weak: []
      },
      xml: {
        strong: [
          /<\?xml\s+version/i,
          /\.(xml|xsd|xsl|xslt)$/i,
          /<\w+(\s+\w+\s*=\s*"[^"]*")*\s*\/?>[\s\S]*<\/\w+>/
        ],
        medium: [
          /<!--[\s\S]*?-->/,
          /<\/\w+>/
        ],
        weak: []
      },
      markdown: {
        strong: [
          /^#{1,6}\s+.+$/m,
          /```[\w]*\n[\s\S]*?\n```/,
          /\.(md|markdown)$/i,
          /\[([^\]]+)\]\(([^)]+)\)/
        ],
        medium: [
          /^\s*[-*+]\s+/m,
          /^\s*\d+\.\s+/m,
          /\*\*[^*\n]+\*\*/,
          /\*[^*\n]+\*/,
          /`[^`\n]+`/,
          /^\s*>\s+/m
        ],
        weak: [
          /\n\s*\n/,
          /^\s*---+\s*$/m
        ]
      },
      sql: {
        strong: [
          /\b(SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|DELETE\s+FROM)\b/i,
          /\b(CREATE\s+(TABLE|DATABASE|INDEX)|DROP\s+(TABLE|DATABASE|INDEX)|ALTER\s+TABLE)\b/i,
          /\.(sql)$/i
        ],
        medium: [
          /\b(JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP\s+BY|ORDER\s+BY|HAVING|WHERE)\b/i,
          /--.*$/m,
          /\/\*[\s\S]*?\*\//
        ],
        weak: [
          /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i
        ]
      },
      php: {
        strong: [
          /<\?php\b/,
          /\.(php|phtml)$/i,
          /\$\w+\s*=/,
          /\bfunction\s+\w+\s*\([^)]*\)\s*\{/
        ],
        medium: [
          /\b(echo|print|var_dump|isset|empty|array)\b/,
          /\$(this|_GET|_POST|_SESSION|_COOKIE)\b/,
          /\/\/.*$|#.*$/m,
          /\/\*[\s\S]*?\*\//
        ],
        weak: [
          /\b(public|private|protected|class|extends)\b/
        ]
      },
      c: {
        strong: [
          /#include\s*<[^>]+\.h>/,
          /\bint\s+main\s*\([^)]*\)\s*\{/,
          /\.(c|h)$/i,
          /\b(printf|scanf|malloc|free)\s*\(/
        ],
        medium: [
          /\b(int|char|float|double|void|struct|typedef|enum)\b/,
          /\bsizeof\s*\(/,
          /\/\*[\s\S]*?\*\/|\/\/.*$/m,
          /\b(if|else|for|while|switch|case|break|continue|return)\b/
        ],
        weak: [
          /\b(stdio|stdlib|string)\.h\b/
        ]
      },
      cpp: {
        strong: [
          /\.(cpp|cxx|cc|hpp|hxx)$/i,
          /#include\s*<[^>]+>/,
          /\b(std::|cout|cin|endl|vector|string|namespace\s+std)\b/,
          /\bclass\s+\w+\s*\{/
        ],
        medium: [
          /\b(public|private|protected):\s*$/m,
          /\b(int|char|float|double|void|bool|auto)\b/,
          /\/\*[\s\S]*?\*\/|\/\/.*$/m,
          /\bnew\s+\w+/,
          /\bdelete\s+/
        ],
        weak: [
          /\b(iostream|vector|string|algorithm)\b/
        ]
      },
      csharp: {
        strong: [
          /\.(cs)$/i,
          /\bnamespace\s+\w+/,
          /\busing\s+System\b/,
          /\bConsole\.(WriteLine|Write)\s*\(/
        ],
        medium: [
          /\b(public|private|protected|internal|static)\s+(class|void|string|int|bool)\b/,
          /\/\/.*$/m,
          /\/\*[\s\S]*?\*\//
        ],
        weak: [
          /\bvar\s+\w+\s*=/
        ]
      },
      ruby: {
        strong: [
          /\.(rb)$/i,
          /\bdef\s+\w+.*\bend\b/s,
          /\bclass\s+\w+.*\bend\b/s,
          /\b(puts|print|p)\s/
        ],
        medium: [
          /\b(if|elsif|else|unless|case|when|for|while|until|do|begin|rescue|ensure|end)\b/,
          /#.*$/m,
          /\b(true|false|nil)\b/,
          /\b(require|include|extend)\b/
        ],
        weak: [
          /\|\w+\|/,
          /@\w+/
        ]
      },
      go: {
        strong: [
          /\.(go)$/i,
          /\bpackage\s+\w+/,
          /\bfunc\s+\w+\s*\(/,
          /\bfmt\.(Print|Println|Printf)\s*\(/
        ],
        medium: [
          /\b(import|var|const|type|struct|interface|map|chan)\b/,
          /\/\/.*$/m,
          /\/\*[\s\S]*?\*\//,
          /:=\s*/
        ],
        weak: [
          /\bgo\s+\w+\(/
        ]
      },
      rust: {
        strong: [
          /\.(rs)$/i,
          /\bfn\s+\w+\s*\(/,
          /\b(println!|print!|panic!|vec!)\s*!/,
          /\buse\s+std::/
        ],
        medium: [
          /\b(let|mut|const|struct|enum|impl|trait|mod|pub|crate)\b/,
          /\/\/.*$/m,
          /\/\*[\s\S]*?\*\//,
          /&\w+/,
          /->\s*\w+/
        ],
        weak: [
          /\bCargo\./
        ]
      },
      yaml: {
        strong: [
          /\.(yml|yaml)$/i,
          /^[\s]*[\w-]+\s*:\s*[\w\s-]+$/m,
          /^[\s]*-\s+[\w-]+:/m
        ],
        medium: [
          /^[\s]*-\s+/m,
          /#.*$/m,
          /^\s*\|\s*$/m,
          /^\s*>\s*$/m
        ],
        weak: []
      },
      dockerfile: {
        strong: [
          /^FROM\s+\w+/m,
          /\b(RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT)\s+/m,
          /\.(dockerfile|Dockerfile)$/i
        ],
        medium: [
          /\b(ENV|ARG|LABEL|USER|VOLUME)\s+/m
        ],
        weak: []
      },
      shell: {
        strong: [
          /^#!/,
          /\.(sh|bash|zsh|fish)$/i,
          /\b(echo|cd|ls|grep|awk|sed|cat|chmod|chown|mkdir|rm|mv|cp)\s+/
        ],
        medium: [
          /#.*$/m,
          /\$\{?\w+\}?/,
          /\|\s*\w+/,
          /&&|\|\|/
        ],
        weak: [
          /\bexport\s+\w+=/
        ]
      }
    };

    this.fileExtensions = {
      js: 'javascript', jsx: 'javascript', ts: 'javascript', tsx: 'javascript', mjs: 'javascript',
      py: 'python', pyw: 'python', pyi: 'python',
      java: 'java', class: 'java',
      html: 'html', htm: 'html', xhtml: 'html',
      css: 'css', scss: 'css', sass: 'css', less: 'css', stylus: 'css',
      json: 'json', jsonc: 'json',
      xml: 'xml', xsd: 'xml', xsl: 'xml', xslt: 'xml', svg: 'xml',
      md: 'markdown', markdown: 'markdown', mdown: 'markdown', mkd: 'markdown',
      sql: 'sql', mysql: 'sql', pgsql: 'sql', sqlite: 'sql',
      php: 'php', phtml: 'php', php3: 'php', php4: 'php', php5: 'php',
      c: 'c', h: 'c',
      cpp: 'cpp', cxx: 'cpp', cc: 'cpp', hpp: 'cpp', hxx: 'cpp', hh: 'cpp',
      cs: 'csharp', csx: 'csharp',
      rb: 'ruby', rbw: 'ruby', rake: 'ruby', gemspec: 'ruby',
      go: 'go', mod: 'go',
      rs: 'rust', rlib: 'rust',
      yml: 'yaml', yaml: 'yaml',
      sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell', ksh: 'shell',
      dockerfile: 'dockerfile'
    };

    // Scoring weights
    this.weights = {
      strong: 10,
      medium: 3,
      weak: 1,
      filename: 15
    };
  }

  /**
   * Detect language from filename with improved extension handling
   */
  detectFromFilename(filename) {
    if (!filename) return null;
    
    // Handle special cases
    if (/^Dockerfile$/i.test(filename) || /\.dockerfile$/i.test(filename)) {
      return 'dockerfile';
    }
    
    if (/^Makefile$/i.test(filename) || /\.mk$/i.test(filename)) {
      return 'shell';
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    return this.fileExtensions[extension] || null;
  }

  /**
   * Enhanced content detection with weighted scoring
   */
  detectFromContent(content) {
    if (!content || content.trim().length === 0) return 'plaintext';

    // Check for clear plain text indicators first
    if (this.isPlainText(content)) {
      return 'plaintext';
    }

    const scores = {};
    const contentLines = content.split('\n');
    const sampleSize = Math.min(50, contentLines.length); // Analyze first 50 lines for efficiency
    const sampleContent = contentLines.slice(0, sampleSize).join('\n');
    
    // Initialize scores
    Object.keys(this.patterns).forEach(lang => {
      scores[lang] = 0;
    });

    // Score each language
    Object.entries(this.patterns).forEach(([language, categories]) => {
      Object.entries(categories).forEach(([category, patterns]) => {
        const weight = this.weights[category];
        
        patterns.forEach(pattern => {
          // Skip filename patterns when analyzing content
          if (pattern.source.includes('\\.(') && pattern.source.includes(')$/i')) {
            return;
          }
          
          const matches = sampleContent.match(new RegExp(pattern.source, pattern.flags + 'g'));
          if (matches) {
            let matchScore = Math.min(matches.length, 5) * weight; // Cap matches per pattern
            
            // Bonus for early matches (first 10 lines are more significant)
            const earlyContent = contentLines.slice(0, 10).join('\n');
            const earlyMatches = earlyContent.match(new RegExp(pattern.source, pattern.flags + 'g'));
            if (earlyMatches) {
              matchScore += earlyMatches.length * weight * 0.5;
            }
            
            scores[language] += matchScore;
          }
        });
      });
    });

    // Apply penalties for conflicting patterns
    this.applyConflictPenalties(scores, sampleContent);

    // Apply plain text penalties for weak matches
    this.applyPlainTextPenalties(scores, sampleContent);

    // Find best match
    const sortedLanguages = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    if (sortedLanguages.length === 0) {
      return 'plaintext';
    }

    const [topLanguage, topScore] = sortedLanguages[0];
    const [, secondScore] = sortedLanguages[1] || [null, 0];
    
    // More conservative thresholds for plain text detection
    const minStrongScore = 15; // Requires at least one strong pattern match
    const minWeakScore = 8;    // For multiple weak matches
    const confidenceRatio = secondScore > 0 ? topScore / secondScore : Infinity;
    
    // Check if we have strong evidence for a language
    const hasStrongEvidence = this.hasStrongLanguageEvidence(topLanguage, sampleContent);
    
    if (!hasStrongEvidence && topScore < minStrongScore) {
      return 'plaintext';
    }
    
    if (topScore < minWeakScore || (confidenceRatio < 1.3 && topScore < 25)) {
      return 'plaintext';
    }

    return topLanguage;
  }

  /**
   * Apply penalties for conflicting language indicators
   */
  applyConflictPenalties(scores, content) {
    // HTML vs XML conflict resolution
    if (scores.html > 0 && scores.xml > 0) {
      if (content.includes('<!DOCTYPE html') || content.includes('<html')) {
        scores.xml *= 0.3;
      } else if (content.includes('<?xml')) {
        scores.html *= 0.3;
      }
    }

    // JavaScript vs JSON conflict
    if (scores.javascript > 0 && scores.json > 0) {
      if (content.includes('function') || content.includes('var ') || content.includes('let ') || content.includes('const ')) {
        scores.json *= 0.1;
      }
    }

    // C vs C++ conflict
    if (scores.c > 0 && scores.cpp > 0) {
      if (content.includes('std::') || content.includes('#include <iostream>') || content.includes('class ')) {
        scores.c *= 0.3;
      } else if (!content.includes('std::') && !content.includes('class ') && !content.includes('namespace')) {
        scores.cpp *= 0.5;
      }
    }

    // Shell vs other languages
    if (scores.shell > 0) {
      const hasShebang = content.startsWith('#!');
      if (!hasShebang && (scores.python > 0 || scores.ruby > 0)) {
        scores.shell *= 0.4;
      }
    }
  }

  /**
   * Check if content appears to be plain text
   */
  isPlainText(content) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    
    // Very short content is likely plain text
    if (content.length < 50 && totalLines <= 3) {
      // Unless it has clear code indicators
      const codeIndicators = [
        /^#!/, // shebang
        /<[a-z]/i, // HTML tags
        /^\s*\{/, // JSON/CSS
        /^\s*<\?/, // XML/PHP
        /\bfunction\s*\(/, // function definitions
        /\bclass\s+\w+/, // class definitions
        /\bdef\s+\w+/, // Python functions
        /\bpublic\s+/, // Java/C# modifiers
        /^FROM\s+/i, // Dockerfile
        /^\w+\s*:\s*\w+/, // YAML-like
        /;\s*$/, // statements ending with semicolon
        /\{[\s\S]*\}/, // code blocks
        /\/\/|\/\*|\#/, // comments (but not standalone # lines)
      ];
      
      const hasCodeIndicator = codeIndicators.some(pattern => pattern.test(content));
      if (!hasCodeIndicator) {
        return true;
      }
    }
    
    // Check for natural language characteristics
    const naturalLanguageScore = this.calculateNaturalLanguageScore(content);
    const codeScore = this.calculateCodeScore(content);
    
    // If it looks more like natural language than code
    if (naturalLanguageScore > codeScore * 1.5 && naturalLanguageScore > 0.3) {
      return true;
    }
    
    // Check for prose patterns
    const proseIndicators = [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, // common English words
      /\b(is|are|was|were|been|being|have|has|had|do|does|did)\b/gi, // verbs
      /[.!?]\s+[A-Z]/g, // sentence endings followed by capital letters
      /\b[A-Z][a-z]+\b/g, // proper capitalization
    ];
    
    let proseMatches = 0;
    proseIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) proseMatches += matches.length;
    });
    
    const proseRatio = proseMatches / content.length;
    
    // High prose ratio suggests plain text
    if (proseRatio > 0.05 && content.length > 100) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate natural language score
   */
  calculateNaturalLanguageScore(content) {
    const indicators = [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by|this|that|these|those)\b/gi,
      /\b(is|are|was|were|been|being|have|has|had|do|does|did|will|would|could|should)\b/gi,
      /[.!?]\s*$/gm, // sentences
      /\b[A-Z][a-z]{2,}\b/g, // words with proper capitalization
      /,\s+/g, // comma usage
    ];
    
    let totalMatches = 0;
    indicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) totalMatches += matches.length;
    });
    
    return totalMatches / Math.max(content.length, 1);
  }

  /**
   * Calculate code score
   */
  calculateCodeScore(content) {
    const indicators = [
      /[{}();]/g, // code punctuation
      /\b(function|class|def|var|let|const|if|for|while)\b/gi, // code keywords
      /[=<>!]+/g, // operators
      /\/\/|\/\*|\*/g, // comments
      /\b0x[0-9a-f]+\b/gi, // hex numbers
      /\d+\.\d+/g, // floating point numbers
    ];
    
    let totalMatches = 0;
    indicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) totalMatches += matches.length;
    });
    
    return totalMatches / Math.max(content.length, 1);
  }

  /**
   * Apply penalties when content looks like plain text
   */
  applyPlainTextPenalties(scores, content) {
    const naturalLanguageScore = this.calculateNaturalLanguageScore(content);
    const codeScore = this.calculateCodeScore(content);
    
    // If content looks like natural language, penalize all programming languages
    if (naturalLanguageScore > codeScore && naturalLanguageScore > 0.02) {
      const penalty = Math.min(0.8, naturalLanguageScore * 10);
      Object.keys(scores).forEach(lang => {
        if (lang !== 'markdown' && lang !== 'plaintext') {
          scores[lang] *= (1 - penalty);
        }
      });
    }
    
    // Penalize languages with very weak evidence
    Object.entries(scores).forEach(([lang, score]) => {
      if (score > 0 && score < 5) {
        const strongEvidence = this.hasStrongLanguageEvidence(lang, content);
        if (!strongEvidence) {
          scores[lang] *= 0.3;
        }
      }
    });
  }

  /**
   * Check if content has strong evidence for a specific language
   */
  hasStrongLanguageEvidence(language, content) {
    if (!this.patterns[language] || !this.patterns[language].strong) {
      return false;
    }
    
    let strongMatches = 0;
    this.patterns[language].strong.forEach(pattern => {
      // Skip filename patterns
      if (pattern.source.includes('\\.(') && pattern.source.includes(')$/i')) {
        return;
      }
      
      if (content.match(pattern)) {
        strongMatches++;
      }
    });
    
    return strongMatches >= 1;
  }

  /**
   * Calculate confidence level based on score and patterns
   */
  calculateConfidence(language, score, content) {
    if (language === 'plaintext') {
      // For plaintext, confidence depends on how clearly it's NOT code
      const naturalLanguageScore = this.calculateNaturalLanguageScore(content);
      const codeScore = this.calculateCodeScore(content);
      
      if (naturalLanguageScore > codeScore * 2) return 'high';
      if (naturalLanguageScore > codeScore) return 'medium';
      return 'low';
    }
    
    const patterns = this.patterns[language];
    if (!patterns) return 'low';
    
    const strongMatches = patterns.strong?.filter(pattern => {
      // Skip filename patterns in confidence calculation
      if (pattern.source.includes('\\.(') && pattern.source.includes(')$/i')) {
        return false;
      }
      return content.match(pattern);
    }).length || 0;
    
    if (strongMatches >= 2 && score >= 25) return 'high';
    if (strongMatches >= 1 && score >= 15) return 'medium';
    if (strongMatches >= 1 || score >= 12) return 'low';
    
    return 'very-low';
  }

  /**
   * Enhanced auto-detection with improved logic
   */
  autoDetect(content, filename = null) {
    // Filename detection with high confidence
    const filenameLanguage = this.detectFromFilename(filename);
    if (filenameLanguage) {
      // Verify filename detection with content if available
      if (content && content.trim().length > 0) {
        const contentLanguage = this.detectFromContent(content);
        
        // If content strongly suggests a different language, use content detection
        if (contentLanguage !== 'plaintext' && contentLanguage !== filenameLanguage) {
          const contentScore = this.getLanguageScore(content, contentLanguage);
          const filenameScore = this.getLanguageScore(content, filenameLanguage);
          
          if (contentScore > filenameScore * 1.5) {
            return {
              language: contentLanguage,
              confidence: this.calculateConfidence(contentLanguage, contentScore, content),
              method: 'content-override',
              alternateDetection: filenameLanguage
            };
          }
        }
      }
      
      return {
        language: filenameLanguage,
        confidence: 'high',
        method: 'filename'
      };
    }

    // Content-only detection
    const contentLanguage = this.detectFromContent(content);
    const score = this.getLanguageScore(content, contentLanguage);
    
    return {
      language: contentLanguage,
      confidence: this.calculateConfidence(contentLanguage, score, content),
      method: 'content'
    };
  }

  /**
   * Get score for a specific language
   */
  getLanguageScore(content, language) {
    if (!this.patterns[language]) return 0;
    
    let score = 0;
    Object.entries(this.patterns[language]).forEach(([category, patterns]) => {
      const weight = this.weights[category];
      patterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern.source, pattern.flags + 'g'));
        if (matches) {
          score += Math.min(matches.length, 5) * weight;
        }
      });
    });
    
    return score;
  }

  /**
   * Get detailed detection results for debugging
   */
  getDetectionDetails(content, filename = null) {
    const results = this.autoDetect(content, filename);
    const scores = {};
    
    // Calculate scores for all languages
    Object.keys(this.patterns).forEach(lang => {
      scores[lang] = this.getLanguageScore(content, lang);
    });
    
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return {
      ...results,
      topScores: sortedScores,
      totalPatterns: Object.keys(this.patterns).length,
      contentLength: content?.length || 0
    };
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return [
      'plaintext',
      ...Object.keys(this.patterns).sort()
    ];
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language) {
    return language === 'plaintext' || this.patterns.hasOwnProperty(language);
  }
}

export default LanguageDetector;