import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import './user-guide.css';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import InputSection from './components/InputSection';
import Controls from './components/Controls';
import Legend from './components/Legend';
import Results from './components/Results';
import ReactUserGuide from './user-guide.js';
import { DiffEngine } from './utils/DiffEngine';
import { ExportUtils } from './utils/ExportUtils';
import { HuggingFaceService } from './utils/HuggingFaceService';
import { GroqService } from './utils/GroqService';
import { LanguageDetector } from './utils/LanguageDetector';
import { NotificationProvider, useNotification } from './components/NotificationProvider';

function QuickDiffApp() {
  // State management
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState('light');
  const [contrast, setContrast] = useState('normal');
  
  // Settings state
  const [settings, setSettings] = useState({
    diffMode: 'line',
    viewMode: 'side-by-side',
    language: 'plaintext',
    autoDetectLanguage: true,
    ignoreCase: false,
    ignoreWhitespace: false,
    ignorePunctuation: false,
    livePreview: false
  });

  // Language detection state
  const [detectedLanguage, setDetectedLanguage] = useState({
    language: 'plaintext',
    confidence: 'low',
    method: 'default'
  });

  // AI state
  const [aiResults, setAiResults] = useState([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Navigation state
  const [changes, setChanges] = useState([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(-1);
  const [minimapVisible, setMinimapVisible] = useState(false);
  
  // Initialize user guide
  useEffect(() => {
    new ReactUserGuide();
  }, []);

  // Refs
  const debounceTimer = useRef(null);
  const diffEngine = useRef(new DiffEngine());
  const exportUtils = useRef(new ExportUtils());
  const hfService = useRef(new HuggingFaceService());
  const groqService = useRef(new GroqService());
  const languageDetector = useRef(new LanguageDetector());
  
  const { showNotification } = useNotification();

  // Settings management functions (defined early to avoid hoisting issues)
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('quickdiff_react_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('quickdiff_react_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('quickdiff_theme') || 'light';
    const savedContrast = localStorage.getItem('quickdiff_contrast') || 'normal';
    setTheme(savedTheme);
    setContrast(savedContrast);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-contrast', savedContrast);
  };

  // Load settings and theme on mount
  useEffect(() => {
    loadSettings();
    loadTheme();
    
    // Debug AI API configurations
    console.log('=== QuickDiff App Debug ===');
    console.log('Environment variables check:');
    console.log('REACT_APP_GROQ_API_KEY:', process.env.REACT_APP_GROQ_API_KEY ? 'Found' : 'Not found');
    console.log('REACT_APP_HUGGINGFACE_API_KEY:', process.env.REACT_APP_HUGGINGFACE_API_KEY ? 'Found' : 'Not found');
    
    if (groqService.current) {
      groqService.current.debugConfig();
      
      // Make Groq service available globally for testing
      window.testGroq = async () => {
        console.log('🧪 Testing Groq API...');
        try {
          const result = await groqService.current.testConnection();
          console.log('🧪 Test result:', result);
          return result;
        } catch (error) {
          console.error('🧪 Test failed:', error);
          return { success: false, error: error.message };
        }
      };
      
      console.log('💡 You can test Groq API by running: testGroq() in console');
    }
    
    if (hfService.current) {
      hfService.current.debugConfig();
      
      // Make HF service available globally for testing
      window.testHF = async () => {
        console.log('🧪 Testing Hugging Face API...');
        try {
          const result = await hfService.current.testConnection();
          console.log('🧪 Test result:', result);
          return result;
        } catch (error) {
          console.error('🧪 Test failed:', error);
          return { success: false, error: error.message };
        }
      };
      
      console.log('💡 You can test HF API by running: testHF() in console');
    }
    console.log('========================');
  }, []);


  // Auto-save settings when they change
  useEffect(() => {
    saveSettings();
  }, [settings, saveSettings]);



  // Collect changes for navigation (defined early to avoid hoisting issues)
  const collectChanges = useCallback((result) => {
    if (!result) return;
    
    const newChanges = [];
    
    // Extract changes from originalLines (DiffEngine returns originalLines and changedLines)
    if (result.originalLines) {
      result.originalLines.forEach((line, index) => {
        if (line.type && line.type !== 'unchanged' && line.type !== '') {
          newChanges.push({
            lineNumber: index + 1,
            type: line.type,
            content: line.content || '',
            originalLineNumber: index + 1,
            changedLineNumber: index + 1
          });
        }
      });
    }
    
    // Also check changedLines for additional changes (like added lines)
    if (result.changedLines) {
      result.changedLines.forEach((line, index) => {
        if (line.type && line.type !== 'unchanged' && line.type !== '') {
          // Avoid duplicates by checking if we already have this change
          const exists = newChanges.some(change => 
            change.lineNumber === index + 1 && change.type === line.type
          );
          if (!exists) {
            newChanges.push({
              lineNumber: index + 1,
              type: line.type,
              content: line.content || '',
              originalLineNumber: index + 1,
              changedLineNumber: index + 1
            });
          }
        }
      });
    }
    
    // Sort changes by line number
    newChanges.sort((a, b) => a.lineNumber - b.lineNumber);
    
    console.log('Collected Changes:', newChanges); // Debug log
    setChanges(newChanges);
    setCurrentChangeIndex(newChanges.length > 0 ? 0 : -1);
    
    if (newChanges.length > 0) {
      showNotification(`Found ${newChanges.length} changes`);
    } else {
      showNotification('No changes detected');
    }
  }, [showNotification]);

  // Main comparison function (defined early to avoid hoisting issues)
  const performComparison = useCallback(() => {
    if (!originalText.trim() && !changedText.trim()) {
      showNotification('Please enter some text to compare');
      return;
    }

    try {
      const result = diffEngine.current.performComparison(
        originalText,
        changedText,
        settings
      );

      console.log('Diff Result:', result); // Debug log
      setDiffResult(result);
      setShowResults(true);
      collectChanges(result);
      
      // Auto-generate AI analysis is disabled to prevent duplicate results
      // Users can manually trigger AI analysis using the AI buttons
      
      // Auto-scroll to results only if live preview is disabled
      if (!settings.livePreview) {
        setTimeout(() => {
          const resultsElement = document.getElementById('results-section');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }

      showNotification('Comparison completed');
    } catch (error) {
      console.error('Comparison error:', error);
      showNotification('Error performing comparison');
    }
  }, [originalText, changedText, settings, showNotification, collectChanges]);

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('quickdiff_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    showNotification(`Switched to ${newTheme} theme`);
  };

  const toggleContrast = () => {
    const newContrast = contrast === 'normal' ? 'high' : 'normal';
    setContrast(newContrast);
    localStorage.setItem('quickdiff_contrast', newContrast);
    document.documentElement.setAttribute('data-contrast', newContrast);
    showNotification(`${newContrast === 'high' ? 'Enabled' : 'Disabled'} high contrast mode`);
  };

  // Text manipulation functions
  const clearAll = () => {
    setOriginalText('');
    setChangedText('');
    setShowResults(false);
    setDiffResult(null);
    setAiResults([]);
    setShowAiResults(false);
    showNotification('All content cleared');
  };

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(changedText);
    setChangedText(temp);
    showNotification('Texts swapped');
    
    if (settings.livePreview && (originalText.trim() || changedText.trim())) {
      performComparison();
    }
  };

  // File handling
  const handleFileLoad = (file, target) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (target === 'original') {
        setOriginalText(content);
      } else {
        setChangedText(content);
      }
      
      // Auto-detect language from filename if enabled
      if (settings.autoDetectLanguage) {
        const detection = languageDetector.current.autoDetect(content, file.name);
        setDetectedLanguage(detection);
        
        if (detection.language !== 'plaintext') {
          setSettings(prev => ({
            ...prev,
            language: detection.language
          }));
        }
        showNotification(`File loaded: ${file.name}`);
      } else {
        showNotification(`File loaded: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Export functions
  const copyResults = () => {
    exportUtils.current.copyResults(originalText, changedText, aiResults)
      .then(() => showNotification('Results copied to clipboard'))
      .catch(() => showNotification('Failed to copy results'));
  };

  const exportToTxt = () => {
    exportUtils.current.exportToTxt(originalText, changedText, diffResult, aiResults);
    showNotification('Exported as TXT file');
  };

  const exportToHtml = () => {
    exportUtils.current.exportToHtml(originalText, changedText, diffResult, aiResults);
    showNotification('Exported as HTML file');
  };

  const exportToMarkdown = () => {
    exportUtils.current.exportToMarkdown(originalText, changedText, diffResult, aiResults);
    showNotification('Exported as Markdown file');
  };

  const exportToPdf = () => {
    exportUtils.current.exportToPdf(originalText, changedText, diffResult, aiResults);
    showNotification('Exported as PDF file');
  };

  // AI functions
  const generateAIAnalysis = async (type) => {
    if (!originalText.trim() && !changedText.trim()) {
      showNotification('Please enter some text to analyze');
      return;
    }

    // Check if this analysis type already exists to prevent duplicates
    const existingAnalysis = aiResults.find(result => result.type === type);
    if (existingAnalysis) {
      showNotification(`${type} analysis already exists. Clear AI results first to regenerate.`);
      return;
    }

    setIsGeneratingAI(true);
    try {
      if (groqService.current.isConfigured()) {
        // Use Groq API when configured (PREFERRED)
        showNotification('Generating AI analysis with Groq...');
        const analysis = await groqService.current.generateAnalysis(type, originalText, changedText);
        setAiResults(prev => [...prev, analysis]);
        setShowAiResults(true);
        showNotification('✅ Groq AI analysis completed');
        
        // Auto-scroll to AI results
        setTimeout(() => {
          const aiResultsElement = document.querySelector('.ai-results-section');
          if (aiResultsElement) {
            aiResultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
        
      } else if (hfService.current.isConfigured()) {
        // Fallback to Hugging Face API
        showNotification('Generating AI analysis with Hugging Face...');
        const analysis = await hfService.current.generateAnalysis(type, originalText, changedText);
        setAiResults(prev => [...prev, analysis]);
        setShowAiResults(true);
        showNotification('✅ Hugging Face AI analysis completed');
        
        // Auto-scroll to AI results
        setTimeout(() => {
          const aiResultsElement = document.querySelector('.ai-results-section');
          if (aiResultsElement) {
            aiResultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
        
      } else {
        // Generate local analysis when no API is configured
        showNotification('Generating local analysis (No AI API configured)');
        const analysis = await hfService.current.generateLocalAnalysis(type, originalText, changedText);
        setAiResults(prev => [...prev, analysis]);
        setShowAiResults(true);
        showNotification('Local analysis completed');
        
        // Auto-scroll to AI results
        setTimeout(() => {
          const aiResultsElement = document.querySelector('.ai-results-section');
          if (aiResultsElement) {
            aiResultsElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Try to generate fallback analysis even on error
      try {
        if (groqService.current.isConfigured() && !error.message.includes('Groq')) {
          // If Groq failed, try Hugging Face
          showNotification('Groq failed, trying Hugging Face...');
          const fallbackAnalysis = await hfService.current.generateAnalysis(type, originalText, changedText);
          setAiResults(prev => [...prev, fallbackAnalysis]);
          setShowAiResults(true);
          showNotification('✅ Hugging Face fallback analysis completed');
          
          // Auto-scroll to AI results
          setTimeout(() => {
            const aiResultsElement = document.querySelector('.ai-results-section');
            if (aiResultsElement) {
              aiResultsElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }, 100);
          
        } else {
          // Generate local analysis as final fallback
          const fallbackAnalysis = await hfService.current.generateLocalAnalysis(type, originalText, changedText);
          setAiResults(prev => [...prev, fallbackAnalysis]);
          setShowAiResults(true);
          showNotification('Local analysis completed (AI services unavailable)');
          
          // Auto-scroll to AI results
          setTimeout(() => {
            const aiResultsElement = document.querySelector('.ai-results-section');
            if (aiResultsElement) {
              aiResultsElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
            }
          }, 100);
        }
      } catch (fallbackError) {
        showNotification(`Analysis failed: ${error.message}`);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const clearAIResults = () => {
    setAiResults([]);
    setShowAiResults(false);
    showNotification('AI results cleared');
  };

  const removeAICard = (index) => {
    setAiResults(prev => prev.filter((_, i) => i !== index));
    showNotification('AI analysis removed');
    
    // Hide AI results section if no cards left
    if (aiResults.length <= 1) {
      setShowAiResults(false);
    }
  };

  // Navigation functions
  const navigateToPreviousChange = () => {
    console.log('Navigate Previous - Changes:', changes.length, 'Current Index:', currentChangeIndex); // Debug log
    if (changes.length === 0) {
      showNotification('No changes to navigate');
      return;
    }
    
    const newIndex = currentChangeIndex > 0 ? currentChangeIndex - 1 : changes.length - 1;
    setCurrentChangeIndex(newIndex);
    scrollToChange(newIndex);
  };

  const navigateToNextChange = () => {
    console.log('Navigate Next - Changes:', changes.length, 'Current Index:', currentChangeIndex); // Debug log
    if (changes.length === 0) {
      showNotification('No changes to navigate');
      return;
    }
    
    const newIndex = currentChangeIndex < changes.length - 1 ? currentChangeIndex + 1 : 0;
    setCurrentChangeIndex(newIndex);
    scrollToChange(newIndex);
  };

  const scrollToChange = (index) => {
    if (index < 0 || index >= changes.length) return;
    
    const change = changes[index];
    
    // Try multiple selectors to find the line
    let lineElement = document.querySelector(`[data-line-number="${change.lineNumber}"][data-line-type="${change.type}"]`);
    
    if (!lineElement) {
      lineElement = document.querySelector(`[data-original-line="${change.lineNumber}"]`);
    }
    
    if (!lineElement) {
      lineElement = document.querySelector(`[data-line-number="${change.lineNumber}"]`);
    }
    
    if (lineElement) {
      // Remove previous highlights
      document.querySelectorAll('.current-change').forEach(el => {
        el.classList.remove('current-change');
      });
      
      lineElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight the current change temporarily
      lineElement.classList.add('current-change');
      setTimeout(() => {
        lineElement.classList.remove('current-change');
      }, 3000);
      
      showNotification(`Navigated to change ${index + 1} of ${changes.length}: ${change.type}`);
    } else {
      showNotification(`Could not find change ${index + 1} (line ${change.lineNumber})`);
    }
  };

  const toggleMinimap = () => {
    setMinimapVisible(!minimapVisible);
    showNotification(minimapVisible ? 'Minimap hidden' : 'Minimap shown');
  };

  // Auto-detect language when text changes
  useEffect(() => {
    if (settings.autoDetectLanguage && (originalText.trim() || changedText.trim())) {
      const combinedText = originalText + '\n' + changedText;
      const detection = languageDetector.current.autoDetect(combinedText);
      
      setDetectedLanguage(detection);
      
      // Auto-update language setting for ANY detection (including plaintext)
      if (detection.language !== settings.language) {
        setSettings(prev => ({
          ...prev,
          language: detection.language
        }));
        
        // Show notification for language changes
        if (detection.language === 'plaintext') {
          console.log('🔍 Auto-detected: Plain text');
        } else {
          console.log(`🔍 Auto-detected: ${detection.language} (${detection.confidence} confidence)`);
        }
      }
    } else if (!settings.autoDetectLanguage) {
      // Reset to default when auto-detect is disabled
      setDetectedLanguage({
        language: 'plaintext',
        confidence: 'low',
        method: 'default'
      });
    } else if (!originalText.trim() && !changedText.trim()) {
      // Reset to plaintext when both text areas are empty
      setDetectedLanguage({
        language: 'plaintext',
        confidence: 'high',
        method: 'empty'
      });
      if (settings.language !== 'plaintext') {
        setSettings(prev => ({
          ...prev,
          language: 'plaintext'
        }));
      }
    }
  }, [originalText, changedText, settings.autoDetectLanguage, settings.language]);

  // Live preview with debouncing
  useEffect(() => {
    if (settings.livePreview && (originalText.trim() || changedText.trim())) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        performComparison();
      }, 500);
    }
    
    return () => clearTimeout(debounceTimer.current);
  }, [originalText, changedText, settings.livePreview, settings.diffMode, settings.ignoreCase, settings.ignoreWhitespace, settings.ignorePunctuation, performComparison]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in text areas or input fields
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return;
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault();
            performComparison();
            showNotification('⌨️ Ctrl+Enter: Comparison started');
            break;
          case 'k':
            e.preventDefault();
            clearAll();
            showNotification('⌨️ Ctrl+K: All content cleared');
            break;
          case 's':
            e.preventDefault();
            swapTexts();
            showNotification('⌨️ Ctrl+S: Texts swapped');
            break;
          case 'c':
            if (showResults) {
              e.preventDefault();
              copyResults();
              showNotification('⌨️ Ctrl+C: Results copied');
            }
            break;
          case 'd':
            e.preventDefault();
            toggleTheme();
            showNotification('⌨️ Ctrl+D: Theme toggled');
            break;
          case 'h':
            e.preventDefault();
            toggleContrast();
            showNotification('⌨️ Ctrl+H: Contrast toggled');
            break;
          case 'm':
            e.preventDefault();
            toggleMinimap();
            showNotification('⌨️ Ctrl+M: Minimap toggled');
            break;
          default:
            break;
        }
      }
      
      // Handle other shortcuts
      switch (e.key) {
        case 'Escape':
          if (showAiResults) {
            clearAIResults();
            showNotification('⌨️ Escape: AI results cleared');
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey) {
            e.preventDefault();
            navigateToPreviousChange();
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey) {
            e.preventDefault();
            navigateToNextChange();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, showAiResults, performComparison, clearAll, swapTexts, copyResults, toggleTheme, toggleContrast, toggleMinimap, clearAIResults, navigateToPreviousChange, navigateToNextChange, showNotification]);

  return (
    <div className="quickdiff-app">
      <div className="container">
        <Header 
          onThemeToggle={toggleTheme}
          onContrastToggle={toggleContrast}
        />
        
        <SettingsPanel 
          settings={settings}
          onSettingsChange={setSettings}
          detectedLanguage={detectedLanguage}
        />
        
        <InputSection
          originalText={originalText}
          changedText={changedText}
          onOriginalTextChange={setOriginalText}
          onChangedTextChange={setChangedText}
          onFileLoad={handleFileLoad}
        />
        
        <Controls
          onCompare={performComparison}
          onClear={clearAll}
          onSwap={swapTexts}
          onCopy={copyResults}
          onExportTxt={exportToTxt}
          onExportHtml={exportToHtml}
          onExportMd={exportToMarkdown}
          onExportPdf={exportToPdf}
          onAIAnalysis={generateAIAnalysis}
          hasResults={showResults}
          isGeneratingAI={isGeneratingAI}
          hfConfigured={hfService.current.isConfigured()}
          groqConfigured={groqService.current.isConfigured()}
        />
        
        <Legend />
        
        {showResults && (
          <Results
            diffResult={diffResult}
            settings={settings}
            changes={changes}
            currentChangeIndex={currentChangeIndex}
            minimapVisible={minimapVisible}
            onNavigatePrevious={navigateToPreviousChange}
            onNavigateNext={navigateToNextChange}
            onToggleMinimap={toggleMinimap}
            onNavigateToChange={(index) => {
              setCurrentChangeIndex(index);
              scrollToChange(index);
            }}
            aiResults={aiResults}
            showAiResults={showAiResults}
            onClearAIResults={clearAIResults}
            onRemoveAICard={removeAICard}
          />
        )}
        
        
      </div>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <QuickDiffApp />
    </NotificationProvider>
  );
}

export default App;