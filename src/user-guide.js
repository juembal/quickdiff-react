/**
 * React-Compatible QuickDiff User Guide
 * Simple spotlight tour on first app open + Quick Guide button
 */

class ReactUserGuide {
    constructor() {
        this.isGuideActive = false;
        this.currentStep = 0;
        this.tourSteps = [
            {
                target: '.title-section',
                title: 'Welcome to QuickDiff! ⚡',
                content: 'A powerful text comparison tool with multiple diff modes, syntax highlighting, and export options. Perfect for developers, writers, and anyone who needs to compare text efficiently.',
                position: 'bottom'
            },
            {
                target: '.header-controls',
                title: 'Theme & Accessibility Controls',
                content: '🔆 High Contrast (Ctrl+H) - Better visibility for accessibility<br>🌓 Dark/Light Theme (Ctrl+D) - Switch between themes<br>❓ Quick Guide - Access this help anytime',
                position: 'bottom'
            },
            {
                target: '.settings-panel',
                title: 'Comparison Settings',
                content: '📊 Diff Mode - Line-by-line, word-by-word, or character-level<br>👁️ View Mode - Side-by-side or inline comparison<br>🎨 Language - Syntax highlighting for code<br>⚙️ Ignore Options - Skip case, whitespace, or punctuation',
                position: 'bottom'
            },
            {
                target: '.input-section',
                title: 'Text Input Areas',
                content: '📝 Original Text (left) - Your base text for comparison<br>📝 Changed Text (right) - Modified version to compare<br>📁 Drag & Drop - Supports .txt, .md, .json, .html, .js, .py, .css files<br>💡 Tip: Files auto-detect programming language!',
                position: 'top'
            },
            {
                target: '.controls',
                title: 'Main Action Controls',
                content: '🔍 Compare Texts (Ctrl+Enter) - Start the comparison<br>🗑️ Clear All (Ctrl+K) - Reset both text areas<br>🔄 Swap Texts (Ctrl+S) - Exchange left and right content<br>📁 Load Files - Upload files from your computer',
                position: 'top'
            },
            {
                target: '.export-controls',
                title: 'Export Your Results',
                content: '📋 Copy (Ctrl+C) - Copy results to clipboard<br>📄 Plain Text - Export as .txt file<br>🌐 HTML - Export with styling and colors<br>📝 Markdown - Export in markdown format<br>📑 PDF - Generate PDF document',
                position: 'top'
            },
            {
                target: '.ai-controls',
                title: '🧠 AI-Powered Analysis Tools',
                content: '🧠 AI Explain (Alt+1) - Detailed analysis of changes and statistics<br>✨ AI Rewrite (Alt+2) - Smart suggestions for improvement<br>📝 AI Summary (Alt+3) - Generate concise summaries<br>🎭 AI Tone (Alt+4) - Analyze writing style and sentiment<br>🧹 AI Cleanup (Alt+5) - Fix formatting and text issues',
                position: 'top'
            }
        ];
        
        this.init();
    }
    
    init() {
        // Wait for React components to render
        this.waitForElements(() => {
            this.createElements();
            this.setupEventListeners();
            
            // Show tour on first visit
            if (!localStorage.getItem('quickdiff-tour-shown')) {
                setTimeout(() => this.startTour(), 1500);
            }
        });
    }
    
    waitForElements(callback) {
        const checkElements = () => {
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) {
                callback();
            } else {
                setTimeout(checkElements, 200);
            }
        };
        checkElements();
    }
    
    createElements() {
        this.createTourOverlay();
        this.createQuickGuideButton();
        this.createQuickGuideModal();
    }
    
    createTourOverlay() {
        // Remove existing overlay
        const existing = document.getElementById('tour-overlay');
        if (existing) existing.remove();
        
        const overlay = document.createElement('div');
        overlay.id = 'tour-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            pointer-events: none;
            display: none;
        `;
        
        overlay.innerHTML = `
            <div id="tour-spotlight" style="
                position: absolute;
                background: transparent;
                border-radius: 12px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8);
                border: 2px solid #B6B09F;
                pointer-events: none;
                transition: all 0.4s ease;
            "></div>
            <div id="tour-tooltip" style="
                position: absolute;
                background: linear-gradient(135deg, #F2F2F2 0%, #EAE4D5 100%);
                border-radius: 15px;
                border: 1px solid #B6B09F;
                box-shadow: 0 4px 20px rgba(182, 176, 159, 0.3);
                max-width: 350px;
                min-width: 280px;
                pointer-events: auto;
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            ">
                <div style="padding: 20px 24px 16px;">
                    <h3 id="tour-title" style="
                        margin: 0 0 12px 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #000000;
                    "></h3>
                    <p id="tour-content" style="
                        margin: 0;
                        color: #000000;
                        line-height: 1.5;
                        font-size: 14px;
                    "></p>
                </div>
                <div style="
                    padding: 0 24px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span id="tour-progress" style="
                        font-size: 12px;
                        color: #B6B09F;
                    "></span>
                    <div style="display: flex; gap: 8px;">
                        <button id="tour-skip" style="
                            padding: 8px 16px;
                            border: 2px solid #B6B09F;
                            background: #F2F2F2;
                            color: #000000;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                            transition: all 0.3s ease;
                        ">Skip</button>
                        <button id="tour-next" style="
                            padding: 8px 16px;
                            border: none;
                            background: linear-gradient(135deg, #000000 0%, #B6B09F 100%);
                            color: #F2F2F2;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 13px;
                            transition: all 0.3s ease;
                        ">Next</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    createQuickGuideButton() {
        // Remove existing button
        const existing = document.getElementById('quick-guide-btn');
        if (existing) existing.remove();
        
        const button = document.createElement('button');
        button.id = 'quick-guide-btn';
        button.innerHTML = '❓';
        button.title = 'Quick Guide';
        button.className = 'btn btn-secondary btn-icon-only';
        // Copy exact styles from contrast/theme buttons - no custom overrides
        
        
        // Add to header controls
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(button);
        }
    }
    
    createQuickGuideModal() {
        // Remove existing modal
        const existing = document.getElementById('quick-guide-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'quick-guide-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                font-family: system-ui, -apple-system, sans-serif;
            ">
                <div style="
                    padding: 24px 32px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #1f2937;
                    ">QuickDiff Guide</h2>
                    <button id="close-guide-modal" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #6b7280;
                        padding: 0;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 6px;
                    ">&times;</button>
                </div>
                <div style="padding: 24px 32px;">
                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                        ">🚀 Getting Started</h3>
                        <ul style="
                            margin: 0;
                            padding-left: 20px;
                            color: #4b5563;
                            line-height: 1.6;
                        ">
                            <li>Paste or type text in both areas</li>
                            <li>Choose your diff mode and settings</li>
                            <li>Click "Compare Texts" to see differences</li>
                            <li>Export results in your preferred format</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                        ">⚙️ Diff Modes</h3>
                        <ul style="
                            margin: 0;
                            padding-left: 20px;
                            color: #4b5563;
                            line-height: 1.6;
                        ">
                            <li><strong>Line-by-line:</strong> Best for code and structured text</li>
                            <li><strong>Word-by-word:</strong> Great for documents and prose</li>
                            <li><strong>Character-level:</strong> Precise for small changes</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                        ">🎨 Features</h3>
                        <ul style="
                            margin: 0;
                            padding-left: 20px;
                            color: #4b5563;
                            line-height: 1.6;
                        ">
                            <li>Drag & drop files for easy loading</li>
                            <li>Live preview for real-time comparison</li>
                            <li>Syntax highlighting for code</li>
                            <li>Multiple export formats</li>
                            <li>Dark/light theme with high contrast mode</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 12px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                        ">⌨️ Keyboard Shortcuts</h3>
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 16px;
                            color: #4b5563;
                            line-height: 1.6;
                            font-size: 14px;
                        ">
                            <div>
                                <h4 style="
                                    margin: 0 0 8px 0;
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: #374151;
                                ">🔧 Main Actions</h4>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+Enter</kbd> Compare</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+K</kbd> Clear All</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+S</kbd> Swap Texts</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+C</kbd> Copy Results</div>
                            </div>
                            <div>
                                <h4 style="
                                    margin: 0 0 8px 0;
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: #374151;
                                ">🎨 Interface</h4>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+D</kbd> Toggle Theme</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Ctrl+H</kbd> High Contrast</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">F1</kbd> Show Guide</div>
                                <div style="margin-bottom: 4px;"><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Escape</kbd> Close Overlays</div>
                            </div>
                        </div>
                        <div style="
                            margin-top: 12px;
                            padding-top: 12px;
                            border-top: 1px solid #e5e7eb;
                        ">
                            <h4 style="
                                margin: 0 0 8px 0;
                                font-size: 14px;
                                font-weight: 600;
                                color: #374151;
                            ">🧠 AI Features</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Alt+1</kbd> AI Explain</div>
                                <div><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Alt+2</kbd> AI Rewrite</div>
                                <div><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Alt+3</kbd> AI Summary</div>
                                <div><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Alt+4</kbd> AI Tone</div>
                                <div><kbd style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">Alt+5</kbd> AI Cleanup</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="
                        background: #f3f4f6;
                        padding: 16px;
                        border-radius: 8px;
                        text-align: center;
                    ">
                        <button id="restart-tour" style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                        ">🎯 Restart Tour</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    setupEventListeners() {
        // Quick Guide button
        const guideBtn = document.getElementById('quick-guide-btn');
        if (guideBtn) {
            guideBtn.addEventListener('click', () => this.showQuickGuide());
        }
        
        // Close modal
        const closeBtn = document.getElementById('close-guide-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideQuickGuide());
        }
        
        // Restart tour
        const restartBtn = document.getElementById('restart-tour');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.hideQuickGuide();
                this.startTour();
            });
        }
        
        // Tour controls
        const skipBtn = document.getElementById('tour-skip');
        const nextBtn = document.getElementById('tour-next');
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.endTour());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('quick-guide-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideQuickGuide();
                }
            });
        }
        
        // Close tour when clicking outside
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.endTour();
                }
            });
        }
    }
    
    startTour() {
        this.isGuideActive = true;
        this.currentStep = 0;
        
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            this.showStep();
        }
    }
    
    showStep() {
        const step = this.tourSteps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            // Try next step if target not found
            this.nextStep();
            return;
        }
        
        // Update tooltip content
        document.getElementById('tour-title').textContent = step.title;
        document.getElementById('tour-content').innerHTML = step.content;
        document.getElementById('tour-progress').textContent = 
            `${this.currentStep + 1} of ${this.tourSteps.length}`;
        
        // Update next button
        const nextBtn = document.getElementById('tour-next');
        if (this.currentStep === this.tourSteps.length - 1) {
            nextBtn.textContent = 'Finish';
        } else {
            nextBtn.textContent = 'Next';
        }
        
        // Position spotlight and tooltip
        setTimeout(() => {
            this.positionSpotlight(target, step.position);
        }, 100);
    }
    
    positionSpotlight(target, position) {
        const spotlight = document.getElementById('tour-spotlight');
        const tooltip = document.getElementById('tour-tooltip');
        
        if (!spotlight || !tooltip || !target) return;
        
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let padding = 12;
        let spotlightRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        
        // Special handling for control groups
        if (target.classList.contains('header-controls') || 
            target.classList.contains('controls') || 
            target.classList.contains('export-controls') ||
            target.classList.contains('ai-controls')) {
            
            const buttons = target.querySelectorAll('button:not([style*="display: none"])');
            if (buttons.length > 0) {
                // Calculate bounding box of all visible buttons
                let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
                
                buttons.forEach(button => {
                    const buttonRect = button.getBoundingClientRect();
                    if (buttonRect.width > 0 && buttonRect.height > 0) {
                        minLeft = Math.min(minLeft, buttonRect.left);
                        minTop = Math.min(minTop, buttonRect.top);
                        maxRight = Math.max(maxRight, buttonRect.right);
                        maxBottom = Math.max(maxBottom, buttonRect.bottom);
                    }
                });
                
                if (minLeft !== Infinity) {
                    spotlightRect = {
                        left: minLeft,
                        top: minTop,
                        width: maxRight - minLeft,
                        height: maxBottom - minTop
                    };
                    padding = 8;
                }
            }
        }
        
        // Position spotlight with scroll offset
        spotlight.style.left = (spotlightRect.left + scrollLeft - padding) + 'px';
        spotlight.style.top = (spotlightRect.top + scrollTop - padding) + 'px';
        spotlight.style.width = (spotlightRect.width + padding * 2) + 'px';
        spotlight.style.height = (spotlightRect.height + padding * 2) + 'px';
        
        // Position tooltip
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + rect.width / 2 - 175;
                top = rect.top - 20;
                tooltip.style.transform = 'translateY(-100%)';
                break;
            case 'bottom':
                left = rect.left + rect.width / 2 - 175;
                top = rect.bottom + 20;
                tooltip.style.transform = 'translateY(0)';
                break;
            default:
                left = rect.left + rect.width / 2 - 175;
                top = rect.bottom + 20;
                tooltip.style.transform = 'translateY(0)';
        }
        
        // Add scroll offset to tooltip
        left += scrollLeft;
        top += scrollTop;
        
        // Keep tooltip on screen
        left = Math.max(scrollLeft + 20, Math.min(left, scrollLeft + window.innerWidth - 370));
        top = Math.max(scrollTop + 20, Math.min(top, scrollTop + window.innerHeight - 200));
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    nextStep() {
        if (this.currentStep < this.tourSteps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.endTour();
        }
    }
    
    endTour() {
        this.isGuideActive = false;
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        localStorage.setItem('quickdiff-tour-shown', 'true');
    }
    
    showQuickGuide() {
        const modal = document.getElementById('quick-guide-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideQuickGuide() {
        const modal = document.getElementById('quick-guide-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Export for React usage
export default ReactUserGuide;

// Make available globally
if (typeof window !== 'undefined') {
    window.ReactUserGuide = ReactUserGuide;
}

// Auto-initialize for React
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.userGuideInitialized) {
            new ReactUserGuide();
            window.userGuideInitialized = true;
        }
    });
}