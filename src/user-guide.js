/**
 * QuickDiff User Guide System
 * Interactive tooltips and guided tour for new users
 */

class QuickDiffUserGuide {
    constructor() {
        this.isGuideActive = false;
        this.currentStep = 0;
        this.guideSteps = [
            {
                target: '.title-section',
                title: 'Welcome to QuickDiff! ⚡',
                content: 'A powerful text comparison tool with multiple diff modes, syntax highlighting, and export options.',
                position: 'bottom'
            },
            {
                target: '.header-controls',
                title: 'Theme & Display Controls',
                content: 'Toggle high contrast (🔆) for better accessibility and dark/light theme (🌓) for comfortable viewing.',
                position: 'bottom'
            },
            {
                target: '#diffMode',
                title: 'Diff Modes',
                content: 'Choose how to compare texts:<br>• <strong>Line-by-line</strong>: Compare entire lines<br>• <strong>Word-by-word</strong>: Compare individual words<br>• <strong>Character-level</strong>: Compare every character',
                position: 'bottom'
            },
            {
                target: '#viewMode',
                title: 'View Modes',
                content: 'Select how to display results:<br>• <strong>Side-by-side</strong>: Show texts in parallel columns<br>• <strong>Inline</strong>: Show unified diff view',
                position: 'bottom'
            },
            {
                target: '#languageSelect',
                title: 'Syntax Highlighting',
                content: 'Choose your programming language for syntax highlighting support (JavaScript, Python, HTML, CSS, etc.)',
                position: 'bottom'
            },
            {
                target: '.ignore-options',
                title: 'Ignore Options',
                content: 'Fine-tune comparison by ignoring:<br>• Case differences<br>• Whitespace changes<br>• Punctuation variations',
                position: 'bottom'
            },
            {
                target: '#originalText',
                title: 'Original Text Input',
                content: 'Paste your original text here or drag & drop a file. Supports .txt, .md, .json, .html, .js, .py, .css files.',
                position: 'top'
            },
            {
                target: '#changedText',
                title: 'Changed Text Input',
                content: 'Paste your modified text here or drag & drop a file for comparison.',
                position: 'top'
            },
            {
                target: '.main-controls',
                title: 'Main Controls',
                content: '• <strong>Compare</strong>: Start the comparison<br>• <strong>Clear All</strong>: Reset both text areas<br>• <strong>Swap</strong>: Exchange original and changed texts',
                position: 'top'
            },
            {
                target: '.export-controls',
                title: 'Export Options',
                content: 'Export your diff results in multiple formats:<br>📋 Copy to clipboard<br>📄 Plain text<br>🌐 HTML<br>📝 Markdown<br>📑 PDF',
                position: 'top'
            },
            {
                target: '#aiControls',
                title: '🧠 AI-Powered Analysis Tools',
                content: 'Unlock powerful AI features to enhance your text analysis:<br>• <strong>🧠 Explain</strong>: Get detailed analysis of changes<br>• <strong>✨ Rewrite</strong>: Receive improvement suggestions<br>• <strong>📝 Summary</strong>: Generate concise summaries<br>• <strong>🎭 Tone</strong>: Analyze writing style and sentiment<br>• <strong>🧹 Cleanup</strong>: Fix formatting and text issues',
                position: 'top'
            },
            {
                target: '#livePreview',
                title: 'Live Preview',
                content: 'Enable automatic comparison as you type (with smart debouncing to avoid performance issues).',
                position: 'bottom'
            },
            {
                target: '#aiResults',
                title: '🎯 AI Analysis Results',
                content: 'AI analysis results appear here as beautiful cards. You can:<br>• Run multiple AI analyses simultaneously<br>• View all results together in a grid layout<br>• Close individual cards or clear all results<br>• Each analysis provides detailed, actionable insights',
                position: 'top'
            }
        ];
        
        this.tooltips = {
            '#contrastToggle': 'Increase contrast for better accessibility',
            '#themeToggle': 'Switch between dark and light themes',
            '#compareBtn': 'Start comparing the two texts',
            '#clearBtn': 'Clear both text areas',
            '#swapBtn': 'Swap the original and changed texts',
            '#copyBtn': 'Copy the diff results to clipboard',
            '#exportTxt': 'Export as plain text file',
            '#exportHtml': 'Export as HTML file with styling',
            '#exportMd': 'Export as Markdown file',
            '#exportPdf': 'Export as PDF document',
            '#aiExplainBtn': '🧠 AI Explain: Get detailed analysis of text changes, statistics, and recommendations',
            '#aiRewriteBtn': '✨ AI Rewrite: Receive intelligent suggestions for improving style, clarity, and structure',
            '#aiSummaryBtn': '📝 AI Summary: Generate concise summaries and extract key points from your text',
            '#aiToneBtn': '🎭 AI Tone: Analyze writing style, sentiment, and formality levels',
            '#aiCleanupBtn': '🧹 AI Cleanup: Detect and fix formatting issues, punctuation, and text problems',
            '#minimapToggle': 'Show/hide overview map of changes',
            '#prevChangeBtn': 'Navigate to previous change',
            '#nextChangeBtn': 'Navigate to next change'
        };
        
        this.init();
    }
    
    init() {
        this.createGuideElements();
        this.setupEventListeners();
        this.setupTooltips();
        
        // Show guide on first visit
        if (!localStorage.getItem('quickdiff-guide-shown')) {
            setTimeout(() => this.startGuide(), 1000);
        }
    }
    
    createGuideElements() {
        // Create guide overlay
        const overlay = document.createElement('div');
        overlay.id = 'guide-overlay';
        overlay.className = 'guide-overlay';
        overlay.innerHTML = `
            <div class="guide-spotlight"></div>
            <div class="guide-tooltip">
                <div class="guide-tooltip-header">
                    <h3 class="guide-tooltip-title"></h3>
                    <button class="guide-close-btn">&times;</button>
                </div>
                <div class="guide-tooltip-content"></div>
                <div class="guide-tooltip-footer">
                    <div class="guide-progress">
                        <span class="guide-step-counter"></span>
                        <div class="guide-progress-bar">
                            <div class="guide-progress-fill"></div>
                        </div>
                    </div>
                    <div class="guide-buttons">
                        <button class="guide-btn guide-btn-secondary" id="guide-skip">Skip Tour</button>
                        <button class="guide-btn guide-btn-secondary" id="guide-prev">Previous</button>
                        <button class="guide-btn guide-btn-primary" id="guide-next">Next</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Create help button
        const helpButton = document.createElement('button');
        helpButton.id = 'help-button';
        helpButton.className = 'help-button';
        helpButton.innerHTML = '❓';
        helpButton.title = 'Show User Guide';
        document.querySelector('.header-controls').appendChild(helpButton);
        
        // Create quick help panel
        const quickHelp = document.createElement('div');
        quickHelp.id = 'quick-help';
        quickHelp.className = 'quick-help-panel';
        quickHelp.innerHTML = `
            <div class="quick-help-header">
                <h3>Quick Help</h3>
                <button class="quick-help-close">&times;</button>
            </div>
            <div class="quick-help-content">
                <div class="help-section">
                    <h4>🚀 Getting Started</h4>
                    <ul>
                        <li>Paste or type text in both areas</li>
                        <li>Choose your diff mode and settings</li>
                        <li>Click "Compare Texts" to see differences</li>
                        <li>Export results in your preferred format</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>⚙️ Diff Modes</h4>
                    <ul>
                        <li><strong>Line-by-line:</strong> Best for code and structured text</li>
                        <li><strong>Word-by-word:</strong> Great for documents and prose</li>
                        <li><strong>Character-level:</strong> Precise for small changes</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>🎨 Features</h4>
                    <ul>
                        <li>Drag & drop files for easy loading</li>
                        <li>Live preview for real-time comparison</li>
                        <li>Syntax highlighting for code</li>
                        <li>Multiple export formats</li>
                        <li>Dark/light theme with high contrast mode</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>🧠 AI-Powered Tools</h4>
                    <ul>
                        <li><strong>🧠 Explain:</strong> Detailed analysis of changes and statistics</li>
                        <li><strong>✨ Rewrite:</strong> Smart suggestions for style and clarity</li>
                        <li><strong>📝 Summary:</strong> Extract key points and generate summaries</li>
                        <li><strong>🎭 Tone:</strong> Analyze sentiment, formality, and writing style</li>
                        <li><strong>🧹 Cleanup:</strong> Fix formatting, punctuation, and text issues</li>
                        <li><em>💡 Tip: Run multiple AI analyses to get comprehensive insights!</em></li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>⌨️ Keyboard Shortcuts</h4>
                    <div class="shortcuts-grid">
                        <div class="shortcuts-column">
                            <h5>🔧 Main Actions</h5>
                            <ul>
                                <li><kbd>Ctrl+Enter</kbd> - Compare texts</li>
                                <li><kbd>Ctrl+K</kbd> - Clear all</li>
                                <li><kbd>Ctrl+S</kbd> - Swap texts</li>
                                <li><kbd>Ctrl+C</kbd> - Copy results</li>
                            </ul>
                        </div>
                        <div class="shortcuts-column">
                            <h5>🎨 Interface</h5>
                            <ul>
                                <li><kbd>Ctrl+D</kbd> - Toggle dark mode</li>
                                <li><kbd>Ctrl+H</kbd> - Toggle contrast</li>
                                <li><kbd>Ctrl+M</kbd> - Toggle minimap</li>
                                <li><kbd>F1</kbd> - Show help</li>
                                <li><kbd>Escape</kbd> - Close overlays</li>
                            </ul>
                        </div>
                        <div class="shortcuts-column">
                            <h5>🧭 Navigation</h5>
                            <ul>
                                <li><kbd>Ctrl+↑</kbd> - Previous change</li>
                                <li><kbd>Ctrl+↓</kbd> - Next change</li>
                            </ul>
                        </div>
                        <div class="shortcuts-column">
                            <h5>🧠 AI Features</h5>
                            <ul>
                                <li><kbd>Alt+1</kbd> - AI Explain</li>
                                <li><kbd>Alt+2</kbd> - AI Rewrite</li>
                                <li><kbd>Alt+3</kbd> - AI Summary</li>
                                <li><kbd>Alt+4</kbd> - AI Tone</li>
                                <li><kbd>Alt+5</kbd> - AI Cleanup</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(quickHelp);
    }
    
    setupEventListeners() {
        // Help button
        document.getElementById('help-button').addEventListener('click', () => {
            this.toggleQuickHelp();
        });
        
        // Guide controls
        document.getElementById('guide-next').addEventListener('click', () => this.nextStep());
        document.getElementById('guide-prev').addEventListener('click', () => this.prevStep());
        document.getElementById('guide-skip').addEventListener('click', () => this.endGuide());
        document.querySelector('.guide-close-btn').addEventListener('click', () => this.endGuide());
        
        // Quick help controls
        document.querySelector('.quick-help-close').addEventListener('click', () => {
            this.hideQuickHelp();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggleQuickHelp();
            }
            if (e.key === 'Escape') {
                if (this.isGuideActive) this.endGuide();
                this.hideQuickHelp();
            }
        });
        
        // Close guide when clicking outside
        document.getElementById('guide-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'guide-overlay') {
                this.endGuide();
            }
        });
        
        // Reposition guide elements on window resize
        window.addEventListener('resize', () => {
            if (this.isGuideActive) {
                setTimeout(() => {
                    const step = this.guideSteps[this.currentStep];
                    const target = document.querySelector(step.target);
                    if (target) {
                        this.positionGuideElements(target, step.position);
                    }
                }, 100);
            }
        });
        
        // Reposition guide elements on scroll
        window.addEventListener('scroll', () => {
            if (this.isGuideActive) {
                const step = this.guideSteps[this.currentStep];
                const target = document.querySelector(step.target);
                if (target) {
                    this.positionGuideElements(target, step.position);
                }
            }
        });
    }
    
    setupTooltips() {
        Object.entries(this.tooltips).forEach(([selector, text]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.setAttribute('data-tooltip', text);
                element.addEventListener('mouseenter', this.showTooltip.bind(this));
                element.addEventListener('mouseleave', this.hideTooltip.bind(this));
            }
        });
    }
    
    showTooltip(e) {
        if (this.isGuideActive) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = e.target.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 10;
        
        // Adjust if tooltip goes off screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) {
            top = rect.bottom + 10;
            tooltip.classList.add('tooltip-below');
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        e.target._tooltip = tooltip;
    }
    
    hideTooltip(e) {
        if (e.target._tooltip) {
            e.target._tooltip.remove();
            e.target._tooltip = null;
        }
    }
    
    startGuide() {
        this.isGuideActive = true;
        this.currentStep = 0;
        document.getElementById('guide-overlay').style.display = 'block';
        document.body.classList.add('guide-active');
        this.showStep();
    }
    
    showStep() {
        const step = this.guideSteps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            console.warn(`Guide target not found: ${step.target}`);
            this.nextStep();
            return;
        }
        
        // Update tooltip content
        document.querySelector('.guide-tooltip-title').textContent = step.title;
        document.querySelector('.guide-tooltip-content').innerHTML = step.content;
        document.querySelector('.guide-step-counter').textContent = 
            `Step ${this.currentStep + 1} of ${this.guideSteps.length}`;
        
        // Update progress bar
        const progress = ((this.currentStep + 1) / this.guideSteps.length) * 100;
        document.querySelector('.guide-progress-fill').style.width = progress + '%';
        
        // Update button states
        document.getElementById('guide-prev').disabled = this.currentStep === 0;
        const nextBtn = document.getElementById('guide-next');
        if (this.currentStep === this.guideSteps.length - 1) {
            nextBtn.textContent = 'Finish';
        } else {
            nextBtn.textContent = 'Next';
        }
        
        // Scroll target into view first
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Position spotlight and tooltip after a short delay to ensure scroll is complete
        setTimeout(() => {
            this.positionGuideElements(target, step.position);
            
            // Make sure spotlight is visible
            const spotlight = document.querySelector('.guide-spotlight');
            spotlight.style.display = 'block';
            spotlight.style.zIndex = '10000';
        }, 300);
    }
    
    positionGuideElements(target, position) {
        const rect = target.getBoundingClientRect();
        const spotlight = document.querySelector('.guide-spotlight');
        const tooltip = document.querySelector('.guide-tooltip');
        
        // Add scroll offset to position calculations
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Calculate spotlight dimensions
        let spotlightRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        let padding = 10;
        
        // For main controls and AI controls, fit tighter around the buttons
        if (target.classList.contains('main-controls') || target.id === 'aiControls') {
            const buttons = target.querySelectorAll('button');
            if (buttons.length > 0) {
                // Calculate the bounding box of all buttons
                let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
                
                buttons.forEach(button => {
                    const buttonRect = button.getBoundingClientRect();
                    minLeft = Math.min(minLeft, buttonRect.left);
                    minTop = Math.min(minTop, buttonRect.top);
                    maxRight = Math.max(maxRight, buttonRect.right);
                    maxBottom = Math.max(maxBottom, buttonRect.bottom);
                });
                
                // Use the tighter bounding box for spotlight
                spotlightRect = {
                    left: minLeft,
                    top: minTop,
                    width: maxRight - minLeft,
                    height: maxBottom - minTop
                };
                padding = 8; // Smaller padding for button groups
            }
        }
        
        // Position spotlight with scroll offset
        spotlight.style.left = (spotlightRect.left + scrollLeft - padding) + 'px';
        spotlight.style.top = (spotlightRect.top + scrollTop - padding) + 'px';
        spotlight.style.width = (spotlightRect.width + (padding * 2)) + 'px';
        spotlight.style.height = (spotlightRect.height + (padding * 2)) + 'px';
        
        // Position tooltip using original rect (for consistent positioning)
        const tooltipRect = tooltip.getBoundingClientRect();
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 20;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 20;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 20;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = rect.right + 20;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            default:
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 20;
                break;
        }
        
        // Add scroll offset to tooltip position
        left += scrollLeft;
        top += scrollTop;
        
        // Adjust if tooltip goes off screen (considering scroll)
        if (left < scrollLeft + 20) left = scrollLeft + 20;
        if (left + tooltipRect.width > scrollLeft + window.innerWidth - 20) {
            left = scrollLeft + window.innerWidth - tooltipRect.width - 20;
        }
        if (top < scrollTop + 20) top = scrollTop + 20;
        if (top + tooltipRect.height > scrollTop + window.innerHeight - 20) {
            top = scrollTop + window.innerHeight - tooltipRect.height - 20;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    nextStep() {
        if (this.currentStep < this.guideSteps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.endGuide();
        }
    }
    
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }
    
    endGuide() {
        this.isGuideActive = false;
        document.getElementById('guide-overlay').style.display = 'none';
        document.body.classList.remove('guide-active');
        localStorage.setItem('quickdiff-guide-shown', 'true');
    }
    
    toggleQuickHelp() {
        const quickHelp = document.getElementById('quick-help');
        if (quickHelp.style.display === 'block') {
            this.hideQuickHelp();
        } else {
            this.showQuickHelp();
        }
    }
    
    showQuickHelp() {
        document.getElementById('quick-help').style.display = 'block';
    }
    
    hideQuickHelp() {
        document.getElementById('quick-help').style.display = 'none';
    }
}

// Make the class available globally for React integration
window.QuickDiffUserGuide = QuickDiffUserGuide;

// Initialize the user guide when DOM is loaded (fallback for non-React usage)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.userGuideInitialized) {
            new QuickDiffUserGuide();
            window.userGuideInitialized = true;
        }
    });
} else {
    // DOM is already loaded
    if (!window.userGuideInitialized) {
        setTimeout(() => {
            new QuickDiffUserGuide();
            window.userGuideInitialized = true;
        }, 100);
    }
}