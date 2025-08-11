/**
 * Language Auto-Detection Utility
 * Detects programming language based on content patterns
 */

export class LanguageDetector {
  constructor() {
    this.patterns = {
      javascript: [
        /\b(function|const|let|var|class|import|export|require)\b/,
        /\b(console\.log|document\.|window\.)\b/,
        /\b(async|await|Promise|setTimeout)\b/,
        /\b(React|useState|useEffect|props)\b/,
        /\b(npm|node|express|axios)\b/,
        /\.(js|jsx|ts|tsx)$/i,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m,
        /\b(if|else|for|while|switch|case|break|continue|return)\b/
      ],
      python: [
        /\b(def|class|import|from|as|if|elif|else|for|while|try|except|finally|with|lambda)\b/,
        /\b(print|input|len|range|enumerate|zip)\b/,
        /\b(self|__init__|__name__|__main__)\b/,
        /\.(py|pyw)$/i,
        /#.*$/m,
        /\b(True|False|None)\b/,
        /\b(and|or|not|in|is)\b/
      ],
      java: [
        /\b(public|private|protected|static|final|abstract|class|interface|extends|implements)\b/,
        /\b(String|int|double|float|boolean|char|void|Object)\b/,
        /\b(System\.out\.println|System\.out\.print)\b/,
        /\.(java)$/i,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m,
        /\b(if|else|for|while|switch|case|break|continue|return|try|catch|finally)\b/
      ],
      html: [
        /<\/?[a-z][\s\S]*>/i,
        /<!DOCTYPE\s+html>/i,
        /<(html|head|body|div|span|p|a|img|script|style|link|meta)\b/i,
        /\.(html|htm)$/i,
        /<!--[\s\S]*?-->/,
        /<\w+(\s+\w+(\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/
      ],
      css: [
        /\{[^}]*\}/,
        /\.(css|scss|sass|less)$/i,
        /@(media|import|keyframes|font-face)/,
        /\b(color|background|margin|padding|border|width|height|font|display)\b:/,
        /\/\*[\s\S]*?\*\//,
        /#[a-fA-F0-9]{3,6}\b/,
        /\b(px|em|rem|vh|vw|%)\b/
      ],
      json: [
        /^\s*[{[]/,
        /\.(json)$/i,
        /"[^"]*"\s*:\s*("[^"]*"|\d+|true|false|null|{|[)/,
        /^\s*\{[\s\S]*\}\s*$/,
        /^\s*\[[\s\S]*\]\s*$/
      ],
      xml: [
        /<\?xml\s+version/i,
        /\.(xml|xsd|xsl|xslt)$/i,
        /<\w+(\s+\w+\s*=\s*"[^"]*")*\s*\/?>[\s\S]*<\/\w+>/,
        /<!--[\s\S]*?-->/
      ],
      markdown: [
        /\.(md|markdown)$/i,
        /^#{1,6}\s+/m,
        /\*\*[^*]+\*\*|\*[^*]+\*/,
        /`[^`]+`|```[\s\S]*?```/,
        /^\s*[-*+]\s+/m,
        /^\s*\d+\.\s+/m,
        /\[([^\]]+)\]\(([^)]+)\)/
      ],
      sql: [
        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE)\b/i,
        /\b(JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP BY|ORDER BY|HAVING)\b/i,
        /\.(sql)$/i,
        /--.*$/m,
        /\/\*[\s\S]*?\*\//
      ],
      php: [
        /<\?php/,
        /\.(php|phtml)$/i,
        /\$\w+/,
        /\b(echo|print|var_dump|isset|empty|array|function|class|public|private|protected)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$|#.*$/m
      ],
      c: [
        /\.(c|h)$/i,
        /#include\s*<[^>]+>/,
        /\b(int|char|float|double|void|struct|typedef|enum)\b/,
        /\b(printf|scanf|malloc|free|sizeof)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m
      ],
      cpp: [
        /\.(cpp|cxx|cc|hpp|hxx)$/i,
        /#include\s*<[^>]+>/,
        /\b(std::|cout|cin|endl|vector|string|class|public|private|protected)\b/,
        /\b(int|char|float|double|void|bool|auto)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m
      ],
      csharp: [
        /\.(cs)$/i,
        /\b(using|namespace|class|public|private|protected|static|void|string|int|bool)\b/,
        /\b(Console\.WriteLine|Console\.Write)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m
      ],
      ruby: [
        /\.(rb)$/i,
        /\b(def|class|module|end|if|elsif|else|unless|case|when|for|while|until|do|begin|rescue|ensure)\b/,
        /\b(puts|print|p|gets|require|include)\b/,
        /#.*$/m,
        /\b(true|false|nil)\b/
      ],
      go: [
        /\.(go)$/i,
        /\b(package|import|func|var|const|type|struct|interface|map|chan)\b/,
        /\b(fmt\.Print|fmt\.Println|fmt\.Printf)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m
      ],
      rust: [
        /\.(rs)$/i,
        /\b(fn|let|mut|const|struct|enum|impl|trait|use|mod|pub|crate)\b/,
        /\b(println!|print!|panic!|vec!)\b/,
        /\/\*[\s\S]*?\*\/|\/\/.*$/m
      ],
      yaml: [
        /\.(yml|yaml)$/i,
        /^[\s]*[\w-]+\s*:/m,
        /^[\s]*-\s+/m,
        /#.*$/m
      ],
      dockerfile: [
        /\.(dockerfile|Dockerfile)$/i,
        /\b(FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT|ENV|ARG)\b/i
      ],
      shell: [
        /\.(sh|bash|zsh|fish)$/i,
        /^#!/,
        /\b(echo|cd|ls|grep|awk|sed|cat|chmod|chown)\b/,
        /#.*$/m,
        /\$\{?\w+\}?/
      ]
    };

    this.fileExtensions = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'javascript',
      tsx: 'javascript',
      py: 'python',
      pyw: 'python',
      java: 'java',
      html: 'html',
      htm: 'html',
      css: 'css',
      scss: 'css',
      sass: 'css',
      less: 'css',
      json: 'json',
      xml: 'xml',
      xsd: 'xml',
      xsl: 'xml',
      xslt: 'xml',
      md: 'markdown',
      markdown: 'markdown',
      sql: 'sql',
      php: 'php',
      phtml: 'php',
      c: 'c',
      h: 'c',
      cpp: 'cpp',
      cxx: 'cpp',
      cc: 'cpp',
      hpp: 'cpp',
      hxx: 'cpp',
      cs: 'csharp',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'shell',
      bash: 'shell',
      zsh: 'shell',
      fish: 'shell'
    };
  }

  /**
   * Detect language from filename
   */
  detectFromFilename(filename) {
    if (!filename) return null;
    
    const extension = filename.split('.').pop()?.toLowerCase();
    return this.fileExtensions[extension] || null;
  }

  /**
   * Detect language from content
   */
  detectFromContent(content) {
    if (!content || content.trim().length === 0) return 'plaintext';

    const scores = {};
    
    // Initialize scores
    Object.keys(this.patterns).forEach(lang => {
      scores[lang] = 0;
    });

    // Score each language based on pattern matches
    Object.entries(this.patterns).forEach(([language, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          scores[language] += matches.length;
          
          // Bonus for strong indicators
          if (this.isStrongIndicator(pattern, language)) {
            scores[language] += 10;
          }
        }
      });
    });

    // Find the language with the highest score
    const sortedLanguages = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0);

    if (sortedLanguages.length === 0) {
      return 'plaintext';
    }

    const [topLanguage, topScore] = sortedLanguages[0];
    
    // Lower threshold for better detection
    if (topScore < 1) {
      return 'plaintext';
    }

    return topLanguage;
  }

  /**
   * Check if pattern is a strong indicator for a language
   */
  isStrongIndicator(pattern, language) {
    const strongIndicators = {
      javascript: [/\b(React|useState|useEffect|props)\b/, /\b(console\.log|document\.|window\.)\b/],
      python: [/\b(def|class|import|from)\b/, /\b(__init__|__name__|__main__)\b/],
      java: [/\b(public\s+class|public\s+static\s+void\s+main)\b/, /\b(System\.out\.println)\b/],
      html: [/<!DOCTYPE\s+html>/i, /<html\b/i],
      css: [/@(media|import|keyframes)/, /\{[^}]*\}/],
      json: [/^\s*[{[]/, /"[^"]*"\s*:\s*/],
      xml: [/<\?xml\s+version/i],
      markdown: [/^#{1,6}\s+/m, /```[\s\S]*?```/],
      sql: [/\b(SELECT|FROM|WHERE)\b/i],
      php: [/<\?php/],
      shell: [/^#!/]
    };

    return strongIndicators[language]?.some(indicator => 
      indicator.toString() === pattern.toString()
    ) || false;
  }

  /**
   * Auto-detect language with confidence score
   */
  autoDetect(content, filename = null) {
    // First try filename detection
    const filenameLanguage = this.detectFromFilename(filename);
    if (filenameLanguage) {
      return {
        language: filenameLanguage,
        confidence: 'high',
        method: 'filename'
      };
    }

    // Then try content detection
    const contentLanguage = this.detectFromContent(content);
    
    // Calculate confidence based on content analysis
    let confidence = 'low';
    if (contentLanguage !== 'plaintext') {
      const patterns = this.patterns[contentLanguage] || [];
      const matchCount = patterns.reduce((count, pattern) => {
        const matches = content.match(pattern);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      if (matchCount >= 10) confidence = 'high';
      else if (matchCount >= 5) confidence = 'medium';
    }

    return {
      language: contentLanguage,
      confidence,
      method: 'content'
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
}

export default LanguageDetector;