/**
 * React-Compatible QuickDiff User Guide
 * Simple spotlight tour on first app open + Quick Guide button
 */

class ReactUserGuide {
    constructor() {
        this.isGuideActive = false;
        this.currentStep = 0;
        this.isRepositioning = false;
        this.scrollListener = null;
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
                content: '📝 Original Text (left) - Your base text for comparison<br>📝 Changed Text (right) - Modified version to compare<br>📁 Drag & Drop - Supports .txt, .md, .json, .html, .js, .py, .css, .pdf files<br>💡 Tip: Files auto-detect programming language!',
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
            
            // Show quick guide on first visit
            if (!localStorage.getItem('quickdiff-guide-shown')) {
                setTimeout(() => {
                    this.showQuickGuide();
                    localStorage.setItem('quickdiff-guide-shown', 'true');
                }, 1500);
            }
        });
    }
    
    waitForElements(callback) {
        let attempts = 0;
        const maxAttempts = 50; // 10 seconds total (50 * 200ms)
        
        const checkElements = () => {
            attempts++;
            const headerControls = document.querySelector('.header-controls');
            
            if (headerControls) {
                console.log(`✅ Header controls found after ${attempts} attempts`);
                callback();
            } else if (attempts >= maxAttempts) {
                console.error('❌ Header controls not found after maximum attempts');
                // Try to initialize anyway
                callback();
            } else {
                console.log(`⏳ Waiting for header controls... (attempt ${attempts}/${maxAttempts})`);
                setTimeout(checkElements, 200);
            }
        };
        checkElements();
    }
    
    createElements() {
        this.createQuickGuideButton();
        this.createQuickGuideModal();
    }
    
    
    createQuickGuideButton() {
        // Remove existing button
        const existing = document.getElementById('quick-guide-btn');
        if (existing) existing.remove();
        
        const button = document.createElement('button');
        button.id = 'quick-guide-btn';
        button.innerHTML = '❓';
        button.title = 'Quick Guide (F1)';
        button.className = 'btn btn-secondary btn-icon-only';
        
        // Ensure button is visible and styled properly
        button.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 1 !important;
        `;
        
        // Add to header controls
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(button);
            console.log('✅ Quick Guide button added to header controls');
        } else {
            console.error('❌ Header controls not found - retrying...');
            // Retry after a short delay
            setTimeout(() => {
                const retryHeaderControls = document.querySelector('.header-controls');
                if (retryHeaderControls) {
                    retryHeaderControls.appendChild(button);
                    console.log('✅ Quick Guide button added to header controls (retry)');
                } else {
                    console.error('❌ Header controls still not found after retry');
                }
            }, 500);
        }
        
        // Add dynamic CSS for theme support
        this.addModalStyles();
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
            <div class="quick-guide-modal-content" style="
                background: #fafbfc;
                border-radius: 16px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(44, 62, 80, 0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                border: 1px solid #d1d9e0;
            ">
                <div style="
                    padding: 24px 32px 20px;
                    border-bottom: 1px solid #d1d9e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #2c3e50;
                    ">QuickDiff Guide</h2>
                    <button id="close-guide-modal" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: #7f8c8d;
                        padding: 0;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    ">&times;</button>
                </div>
                <div style="padding: 28px 36px;">
                    <!-- Welcome Section -->
                    <div style="
                        text-align: center;
                        margin-bottom: 32px;
                        padding: 20px;
                        background: #F2F2F2;
                        border-radius: 12px;
                        border: 1px solid #B6B09F;
                    ">
                        <h2 style="
                            margin: 0 0 8px 0;
                            font-size: 22px;
                            font-weight: 700;
                            color: #000000;
                        ">Welcome to QuickDiff! ⚡</h2>
                        <p style="
                            margin: 0;
                            font-size: 16px;
                            color: #000000;
                            line-height: 1.5;
                        ">Your powerful text comparison tool with AI-powered analysis</p>
                    </div>

                    <div style="margin-bottom: 28px;">
                        <h3 style="
                            margin: 0 0 16px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #000000;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">🚀 Quick Start Guide</h3>
                        <div style="
                            background: #F2F2F2;
                            padding: 20px;
                            border-radius: 10px;
                            border-left: 4px solid #B6B09F;
                        ">
                            <ol style="
                                margin: 0;
                                padding-left: 20px;
                                color: #000000;
                                line-height: 1.8;
                                font-size: 15px;
                            ">
                                <li><strong>Add your text:</strong> Paste or drag & drop files into both text areas</li>
                                <li><strong>Choose settings:</strong> Select diff mode, view style, and language</li>
                                <li><strong>Compare:</strong> Click "Compare Texts" or press Ctrl+Enter</li>
                                <li><strong>Analyze:</strong> Use AI tools for deeper insights and improvements</li>
                                <li><strong>Export:</strong> Save results in your preferred format</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 28px;">
                        <h3 style="
                            margin: 0 0 16px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #000000;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">⚙️ Comparison Modes</h3>
                        <div style="
                            background: #F2F2F2;
                            padding: 20px;
                            border-radius: 12px;
                            border: 1px solid #B6B09F;
                        ">
                            <div style="
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 12px;
                            ">
                                <div style="
                                    padding: 16px;
                                    background: #F2F2F2;
                                    border-radius: 8px;
                                    border: 1px solid #B6B09F;
                                ">
                                    <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 15px;">📝 Line-by-line</h4>
                                    <p style="margin: 0; color: #000000; font-size: 14px; line-height: 1.4;">Perfect for code, configuration files, and structured documents</p>
                                </div>
                                <div style="
                                    padding: 16px;
                                    background: #F2F2F2;
                                    border-radius: 8px;
                                    border: 1px solid #B6B09F;
                                ">
                                    <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 15px;">🔤 Word-by-word</h4>
                                    <p style="margin: 0; color: #000000; font-size: 14px; line-height: 1.4;">Ideal for documents, articles, and prose writing</p>
                                </div>
                                <div style="
                                    padding: 16px;
                                    background: #F2F2F2;
                                    border-radius: 8px;
                                    border: 1px solid #B6B09F;
                                ">
                                    <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 15px;">🔍 Character-level</h4>
                                    <p style="margin: 0; color: #000000; font-size: 14px; line-height: 1.4;">Ultra-precise comparison for detecting tiny changes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 28px;">
                        <h3 style="
                            margin: 0 0 16px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #000000;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">🧠 AI-Powered Features</h3>
                        <div style="
                            background: #F2F2F2;
                            padding: 20px;
                            border-radius: 12px;
                            border: 1px solid #B6B09F;
                            margin-bottom: 20px;
                        ">
                            <div style="
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                                gap: 16px;
                            ">
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">AI Explain</h4>
                                    <p style="margin: 0; font-size: 12px; color: #000000;">Detailed analysis</p>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 8px;">✨</div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">AI Rewrite</h4>
                                    <p style="margin: 0; font-size: 12px; color: #000000;">Smart suggestions</p>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">AI Summary</h4>
                                    <p style="margin: 0; font-size: 12px; color: #000000;">Key insights</p>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 8px;">🎭</div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">AI Tone</h4>
                                    <p style="margin: 0; font-size: 12px; color: #000000;">Style analysis</p>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: 8px;">🧹</div>
                                    <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #000000;">AI Cleanup</h4>
                                    <p style="margin: 0; font-size: 12px; color: #000000;">Fix formatting</p>
                                </div>
                            </div>
                        </div>
                        
                        <h4 style="
                            margin: 0 0 12px 0;
                            font-size: 16px;
                            font-weight: 600;
                            color: #000000;
                        ">🎨 Core Features</h4>
                        <div style="
                            background: #F2F2F2;
                            padding: 20px;
                            border-radius: 12px;
                            border: 1px solid #B6B09F;
                        ">
                            <div style="
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                gap: 12px;
                            ">
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">📁</span>
                                    <span style="font-size: 14px; color: #000000;">Drag & drop file support</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">⚡</span>
                                    <span style="font-size: 14px; color: #000000;">Live preview mode</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">🎨</span>
                                    <span style="font-size: 14px; color: #000000;">Syntax highlighting</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">📤</span>
                                    <span style="font-size: 14px; color: #000000;">Multiple export formats</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">🌓</span>
                                    <span style="font-size: 14px; color: #000000;">Dark/light themes</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                                    <span style="font-size: 16px;">♿</span>
                                    <span style="font-size: 14px; color: #000000;">High contrast mode</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="
                            margin: 0 0 16px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #000000;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">⌨️ Keyboard Shortcuts</h3>
                        <div style="
                            background: #F2F2F2;
                            padding: 20px;
                            border-radius: 12px;
                            border: 1px solid #B6B09F;
                        ">
                            <div style="
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 16px;
                                color: #000000;
                                line-height: 1.6;
                                font-size: 14px;
                            ">
                                <div>
                                    <h4 style="
                                        margin: 0 0 8px 0;
                                        font-size: 14px;
                                        font-weight: 600;
                                        color: #000000;
                                    ">🔧 Main Actions</h4>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+Enter</kbd> Compare</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+K</kbd> Clear All</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+S</kbd> Swap Texts</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+C</kbd> Copy Results</div>
                                </div>
                                <div>
                                    <h4 style="
                                        margin: 0 0 8px 0;
                                        font-size: 14px;
                                        font-weight: 600;
                                        color: #000000;
                                    ">🎨 Interface</h4>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+D</kbd> Toggle Theme</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Ctrl+H</kbd> High Contrast</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">F1</kbd> Show Guide</div>
                                    <div style="margin-bottom: 4px;"><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Escape</kbd> Close Overlays</div>
                                </div>
                            </div>
                            <div style="
                                margin-top: 12px;
                                padding-top: 12px;
                                border-top: 1px solid #B6B09F;
                            ">
                                <h4 style="
                                    margin: 0 0 8px 0;
                                    font-size: 14px;
                                    font-weight: 600;
                                    color: #000000;
                                ">🧠 AI Features</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <div><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Alt+1</kbd> AI Explain</div>
                                    <div><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Alt+2</kbd> AI Rewrite</div>
                                    <div><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Alt+3</kbd> AI Summary</div>
                                    <div><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Alt+4</kbd> AI Tone</div>
                                    <div><kbd style="background: #EAE4D5; padding: 2px 6px; border-radius: 3px; font-size: 12px; border: 1px solid #B6B09F; color: #000000;">Alt+5</kbd> AI Cleanup</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pro Tips Section -->
                    <div style="
                        background: #F2F2F2;
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #B6B09F;
                        margin-bottom: 24px;
                    ">
                        <h4 style="
                            margin: 0 0 12px 0;
                            font-size: 16px;
                            font-weight: 600;
                            color: #000000;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">💡 Pro Tips</h4>
                        <ul style="
                            margin: 0;
                            padding-left: 20px;
                            color: #000000;
                            line-height: 1.6;
                            font-size: 14px;
                        ">
                            <li>Use <strong>Ctrl+Enter</strong> for quick comparisons</li>
                            <li>Try different diff modes for various content types</li>
                            <li>Combine multiple AI analyses for comprehensive insights</li>
                            <li>Export to PDF for professional reports</li>
                            <li>Use high contrast mode for better accessibility</li>
                        </ul>
                    </div>

                    <!-- Footer Actions -->
                    <div style="
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                        background: #ecf0f1;
                        border-radius: 12px;
                        border: 1px solid #d1d9e0;
                    ">
                        <button id="close-guide-footer" style="
                            background: #2c3e50;
                            color: #ffffff;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.3s ease;
                        ">Got it!</button>
                        <span style="color: #2c3e50; font-size: 14px;">Press F1 anytime to reopen this guide</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    addModalStyles() {
        // Remove existing styles
        const existingStyles = document.getElementById('quick-guide-dynamic-styles');
        if (existingStyles) existingStyles.remove();
        
        const style = document.createElement('style');
        style.id = 'quick-guide-dynamic-styles';
        style.textContent = `
            /* Quick Guide Modal Theme Support */
            [data-theme="dark"] .quick-guide-modal-content {
                background: #2a2a2a !important;
                border: 1px solid #404040 !important;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
            }
            
            [data-theme="dark"] .quick-guide-modal-content h2,
            [data-theme="dark"] .quick-guide-modal-content h3,
            [data-theme="dark"] .quick-guide-modal-content h4,
            [data-theme="dark"] .quick-guide-modal-content ul,
            [data-theme="dark"] .quick-guide-modal-content ol,
            [data-theme="dark"] .quick-guide-modal-content li,
            [data-theme="dark"] .quick-guide-modal-content p,
            [data-theme="dark"] .quick-guide-modal-content span,
            [data-theme="dark"] .quick-guide-modal-content div {
                color: #e0e0e0 !important;
            }
            
            /* Dark mode background overrides */
            [data-theme="dark"] .quick-guide-modal-content div[style*="background: #F2F2F2"] {
                background: #3a3a3a !important;
            }
            
            /* Dark mode border overrides for inner cards */
            [data-theme="dark"] .quick-guide-modal-content div[style*="border: 1px solid #B6B09F"] {
                border: 1px solid #555555 !important;
            }
            
            [data-theme="dark"] .quick-guide-modal-content kbd {
                background: #1e1e1e !important;
                border: 1px solid #555555 !important;
                color: #e0e0e0 !important;
            }
            
            [data-theme="dark"] .quick-guide-modal-content kbd[style*="background: #EAE4D5"] {
                background: #1e1e1e !important;
            }
            
            [data-theme="dark"] #close-guide-footer {
                background: #888888 !important;
                color: #1e1e1e !important;
            }
            
            [data-theme="dark"] #close-guide-modal {
                color: #a0a0a0 !important;
            }
            
            [data-theme="dark"] #close-guide-modal:hover {
                background: rgba(136, 136, 136, 0.2) !important;
                color: #e0e0e0 !important;
            }
            
            [data-theme="dark"] #restart-tour {
                background: linear-gradient(135deg, #888888 0%, #666666 100%) !important;
                color: #e0e0e0 !important;
                border: 1px solid #555555 !important;
            }
            
            [data-theme="dark"] #restart-tour:hover {
                background: linear-gradient(135deg, #999999 0%, #777777 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 25px rgba(136, 136, 136, 0.3) !important;
            }
            
            [data-theme="dark"] .quick-guide-modal-content span[style*="color: #2c3e50"] {
                color: #a0a0a0 !important;
            }
            
            /* Light theme hover effects */
            #close-guide-modal:hover {
                background: rgba(182, 176, 159, 0.1) !important;
                color: #000000 !important;
            }
            
            #restart-tour:hover {
                background: linear-gradient(135deg, #B6B09F 0%, #000000 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4) !important;
            }
            
            /* High contrast support */
            [data-contrast="high"] .quick-guide-modal-content {
                border: 3px solid #000000 !important;
                background: #ffffff !important;
            }
            
            [data-contrast="high"] .quick-guide-modal-content h2,
            [data-contrast="high"] .quick-guide-modal-content h3,
            [data-contrast="high"] .quick-guide-modal-content h4,
            [data-contrast="high"] .quick-guide-modal-content ul,
            [data-contrast="high"] .quick-guide-modal-content div {
                color: #000000 !important;
                font-weight: 700 !important;
            }
            
            [data-contrast="high"] .quick-guide-modal-content kbd {
                background: #ffffff !important;
                border: 3px solid #000000 !important;
                color: #000000 !important;
                font-weight: 700 !important;
            }
            
            [data-contrast="high"] #restart-tour {
                background: #000000 !important;
                color: #ffffff !important;
                border: 3px solid #ffffff !important;
                font-weight: 700 !important;
            }
            
            [data-contrast="high"] #restart-tour:hover {
                background: #ffffff !important;
                color: #000000 !important;
                border: 3px solid #000000 !important;
            }
            
            /* Dark + High contrast */
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content {
                border: 3px solid #ffffff !important;
                background: #000000 !important;
            }
            
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content h2,
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content h3,
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content h4,
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content ul,
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content div {
                color: #ffffff !important;
                font-weight: 700 !important;
            }
            
            [data-theme="dark"][data-contrast="high"] .quick-guide-modal-content kbd {
                background: #000000 !important;
                border: 3px solid #ffffff !important;
                color: #ffffff !important;
                font-weight: 700 !important;
            }
            
            [data-theme="dark"][data-contrast="high"] #restart-tour {
                background: #ffffff !important;
                color: #000000 !important;
                border: 3px solid #000000 !important;
                font-weight: 700 !important;
            }
            
            [data-theme="dark"][data-contrast="high"] #restart-tour:hover {
                background: #000000 !important;
                color: #ffffff !important;
                border: 3px solid #ffffff !important;
            }
        `;
        
        document.head.appendChild(style);
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
        
        // Footer close button
        const footerCloseBtn = document.getElementById('close-guide-footer');
        if (footerCloseBtn) {
            footerCloseBtn.addEventListener('click', () => {
                this.hideQuickGuide();
            });
        }
        
        // Keyboard shortcuts for opening guide
        this.keydownHandler = (e) => {
            // F1 key (keyCode 112) - traditional help key
            if (e.key === 'F1' || e.keyCode === 112) {
                e.preventDefault();
                this.showQuickGuide();
                return;
            }
            
            // Ctrl+? or Ctrl+/ - more accessible alternative
            if ((e.ctrlKey || e.metaKey) && (e.key === '?' || e.key === '/')) {
                e.preventDefault();
                this.showQuickGuide();
                return;
            }
            
            // Escape key to close guide
            if (e.key === 'Escape') {
                const modal = document.getElementById('quick-guide-modal');
                if (modal && modal.style.display === 'flex') {
                    e.preventDefault();
                    this.hideQuickGuide();
                }
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        
        // Close modal when clicking outside
        const modal = document.getElementById('quick-guide-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideQuickGuide();
                }
            });
        }
        
        
        // Mobile-specific event handlers
        if (window.innerWidth <= 768) {
            // Handle orientation change on mobile
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (this.isGuideActive) {
                        const step = this.tourSteps[this.currentStep];
                        const target = document.querySelector(step.target);
                        if (target) {
                            this.positionSpotlight(target, step.position);
                        }
                    }
                }, 500);
            });
            
            // Handle window resize on mobile
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (this.isGuideActive) {
                        const step = this.tourSteps[this.currentStep];
                        const target = document.querySelector(step.target);
                        if (target) {
                            this.positionSpotlight(target, step.position);
                        }
                    }
                }, 300);
            });
            
            // Prevent zoom issues on mobile
            const tooltip = document.getElementById('tour-tooltip');
            if (tooltip) {
                tooltip.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                }, { passive: false });
            }
        }
        
        // Reposition guide elements on window resize (from working implementation)
        window.addEventListener('resize', () => {
            if (this.isGuideActive) {
                setTimeout(() => {
                    const step = this.tourSteps[this.currentStep];
                    const target = document.querySelector(step.target);
                    if (target) {
                        this.positionGuideElements(target, step.position);
                    }
                }, 100);
            }
        });
        
        // Reposition guide elements on scroll (from working implementation)
        window.addEventListener('scroll', () => {
            if (this.isGuideActive) {
                const step = this.tourSteps[this.currentStep];
                const target = document.querySelector(step.target);
                if (target) {
                    this.positionGuideElements(target, step.position);
                }
            }
        });
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
        
        // Apply mobile-specific tooltip styles
        this.applyMobileTooltipStyles();
        
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
    
    applyMobileTooltipStyles() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        if (!isMobile) return;
        
        const tooltip = document.getElementById('tour-tooltip');
        const tooltipBody = document.getElementById('tour-tooltip-body');
        const tooltipFooter = document.getElementById('tour-tooltip-footer');
        const title = document.getElementById('tour-title');
        const content = document.getElementById('tour-content');
        
        if (tooltip) {
            tooltip.style.maxWidth = isSmallMobile ? '95vw' : '90vw';
            tooltip.style.minWidth = isSmallMobile ? 'min(260px, 90vw)' : 'min(280px, 85vw)';
            tooltip.style.margin = isSmallMobile ? '8px' : '10px';
        }
        
        if (tooltipBody) {
            tooltipBody.style.padding = isSmallMobile ? '16px 20px 12px' : '18px 22px 14px';
        }
        
        if (tooltipFooter) {
            tooltipFooter.style.padding = isSmallMobile ? '0 16px 16px' : '0 20px 18px';
            tooltipFooter.style.display = 'flex';
            tooltipFooter.style.width = '100%';
            tooltipFooter.style.boxSizing = 'border-box';
            
            if (isSmallMobile) {
                tooltipFooter.style.flexDirection = 'column';
                tooltipFooter.style.gap = '12px';
                tooltipFooter.style.alignItems = 'stretch';
            } else {
                // Reset to default for tablets and desktop
                tooltipFooter.style.flexDirection = 'row';
                tooltipFooter.style.alignItems = 'center';
                tooltipFooter.style.justifyContent = 'space-between';
            }
        }
        
        if (title) {
            title.style.fontSize = isSmallMobile ? '16px' : '17px';
        }
        
        if (content) {
            content.style.fontSize = isSmallMobile ? '13px' : '14px';
            content.style.lineHeight = '1.4';
        }
        
        // Adjust button sizes for mobile
        const skipBtn = document.getElementById('tour-skip');
        const nextBtn = document.getElementById('tour-next');
        const progressSpan = document.getElementById('tour-progress');
        
        if (skipBtn && nextBtn) {
            // Get buttons container
            const buttonsContainer = skipBtn.parentElement;
            
            if (isSmallMobile) {
                // Mobile phone layout - stack buttons vertically with better visibility
                skipBtn.style.cssText = 'padding: 12px 20px; font-size: 15px; min-width: 120px; width: 100%; margin: 0; border: 2px solid #B6B09F; background: #F2F2F2; color: #000000; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
                nextBtn.style.cssText = 'padding: 12px 20px; font-size: 15px; min-width: 120px; width: 100%; margin: 0; background: linear-gradient(135deg, #000000 0%, #B6B09F 100%); color: #F2F2F2; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
                
                // Configure buttons container for mobile
                if (buttonsContainer) {
                    buttonsContainer.style.display = 'flex';
                    buttonsContainer.style.flexDirection = 'column';
                    buttonsContainer.style.gap = '12px';
                    buttonsContainer.style.width = '100%';
                    buttonsContainer.style.alignItems = 'stretch';
                    buttonsContainer.style.justifyContent = 'center';
                }
            } else if (isMobile) {
                // Tablet layout - side by side but larger and more visible
                skipBtn.style.cssText = 'padding: 10px 18px; font-size: 14px; min-width: 90px; margin: 0; border: 2px solid #B6B09F; background: #F2F2F2; color: #000000; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; font-weight: 500; box-shadow: 0 2px 6px rgba(0,0,0,0.1);';
                nextBtn.style.cssText = 'padding: 10px 18px; font-size: 14px; min-width: 90px; margin: 0; background: linear-gradient(135deg, #000000 0%, #B6B09F 100%); color: #F2F2F2; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box; font-weight: 500; box-shadow: 0 2px 6px rgba(0,0,0,0.15);';
                
                // Configure buttons container for tablet
                if (buttonsContainer) {
                    buttonsContainer.style.display = 'flex';
                    buttonsContainer.style.flexDirection = 'row';
                    buttonsContainer.style.gap = '12px';
                    buttonsContainer.style.justifyContent = 'center';
                    buttonsContainer.style.alignItems = 'center';
                }
            } else {
                // Desktop layout - original styling
                skipBtn.style.cssText = 'padding: 8px 16px; font-size: 13px; min-width: 70px; border: 2px solid #B6B09F; background: #F2F2F2; color: #000000; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;';
                nextBtn.style.cssText = 'padding: 8px 16px; font-size: 13px; min-width: 70px; background: linear-gradient(135deg, #000000 0%, #B6B09F 100%); color: #F2F2F2; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;';
                
                // Configure buttons container for desktop
                if (buttonsContainer) {
                    buttonsContainer.style.display = 'flex';
                    buttonsContainer.style.flexDirection = 'row';
                    buttonsContainer.style.gap = '8px';
                }
            }
        }
        
        // Adjust progress text for mobile
        if (progressSpan) {
            progressSpan.style.fontSize = isSmallMobile ? '11px' : '12px';
            if (isSmallMobile) {
                progressSpan.style.textAlign = 'center';
                progressSpan.style.width = '100%';
            }
        }
    }
    
    positionSpotlight(target, position) {
        // Scroll target into view first
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Position spotlight and tooltip after a short delay to ensure scroll is complete
        setTimeout(() => {
            this.positionGuideElements(target, position);
            
            // Make sure spotlight is visible
            const spotlight = document.querySelector('#tour-spotlight');
            if (spotlight) {
                spotlight.style.display = 'block';
                spotlight.style.zIndex = '10000';
            }
        }, 300);
    }
    
    positionGuideElements(target, position) {
        const rect = target.getBoundingClientRect();
        const spotlight = document.querySelector('#tour-spotlight');
        const tooltip = document.querySelector('#tour-tooltip');
        
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
        if (target.classList.contains('main-controls') || 
            target.classList.contains('controls') ||
            target.classList.contains('header-controls') ||
            target.classList.contains('export-controls') ||
            target.classList.contains('ai-controls') ||
            target.id === 'aiControls') {
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
        
        // Mark tour as shown
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
    
    // Cleanup method for React component unmounting
    destroy() {
        this.endTour();
        
        // Remove all event listeners
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
        
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        // Remove DOM elements
        const overlay = document.getElementById('tour-overlay');
        const modal = document.getElementById('quick-guide-modal');
        const button = document.getElementById('quick-guide-btn');
        const styles = document.getElementById('quick-guide-dynamic-styles');
        
        if (overlay) overlay.remove();
        if (modal) modal.remove();
        if (button) button.remove();
        if (styles) styles.remove();
        
        // Reset global flag
        window.userGuideInitialized = false;
    }
}

// Export for React usage
export default ReactUserGuide;

// Make available globally
if (typeof window !== 'undefined') {
    window.ReactUserGuide = ReactUserGuide;
}

// Auto-initialize for React - only if not already initialized by React component
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit to see if React component initializes it first
        setTimeout(() => {
            if (!window.userGuideInitialized) {
                new ReactUserGuide();
                window.userGuideInitialized = true;
            }
        }, 100);
    });
}