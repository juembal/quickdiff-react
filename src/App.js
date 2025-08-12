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
import { GroqService } from './utils/GroqService';
import { LanguageDetector } from './utils/LanguageDetector';
import PDFTextExtractor from './utils/PDFTextExtractor';
import { NotificationProvider, useNotification } from './components/NotificationProvider';

function QuickDiffApp() {
  // State management
  const [originalText, setOriginalText] = useState('');
  const [changedText, setChangedText] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState('light');
  const [contrast, setContrast] = useState('normal');
  
  // Track last compared texts to prevent AI analysis on uncompared content
  const [lastComparedOriginal, setLastComparedOriginal] = useState('');
  const [lastComparedChanged, setLastComparedChanged] = useState('');
  
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
    if (!window.userGuideInitialized) {
      userGuide.current = new ReactUserGuide();
      window.userGuideInitialized = true;
    }
    
    // Cleanup function
    return () => {
      if (userGuide.current) {
        userGuide.current.destroy();
        userGuide.current = null;
      }
    };
  }, []);

  // Refs
  const debounceTimer = useRef(null);
  const diffEngine = useRef(new DiffEngine());
  const exportUtils = useRef(new ExportUtils());
  const groqService = useRef(new GroqService());
  const languageDetector = useRef(new LanguageDetector());
  const pdfExtractor = useRef(new PDFTextExtractor());
  const userGuide = useRef(null);
  
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
    
    // Handle different diff modes
    if (settings.diffMode === 'word' || settings.diffMode === 'char') {
      // For word and character modes, use stats to determine actual change count
      let changeCount = 0;
      let changeType = 'modified';
      let changeDescription = '';
      
      if (result.stats) {
        if (settings.diffMode === 'word') {
          const wordsAdded = result.stats.wordsAdded || 0;
          const wordsRemoved = result.stats.wordsRemoved || 0;
          const wordsModified = result.stats.wordsModified || 0;
          
          // Use totalChanges if available, otherwise calculate
          changeCount = result.stats.totalChanges || (wordsAdded + wordsRemoved + wordsModified);
          
          if (wordsModified > 0) {
            if (wordsAdded > 0 || wordsRemoved > 0) {
              changeDescription = `${wordsModified} words modified, ${wordsRemoved} removed, ${wordsAdded} added`;
            } else {
              changeDescription = `${wordsModified} words modified`;
            }
            changeType = 'modified';
          } else if (wordsAdded > 0 && wordsRemoved > 0) {
            changeDescription = `${wordsRemoved} words removed, ${wordsAdded} words added`;
            changeType = 'modified';
          } else if (wordsAdded > 0) {
            changeDescription = `${wordsAdded} words added`;
            changeType = 'added';
          } else if (wordsRemoved > 0) {
            changeDescription = `${wordsRemoved} words removed`;
            changeType = 'removed';
          }
        } else if (settings.diffMode === 'char') {
          const charsAdded = result.stats.charactersAdded || 0;
          const charsRemoved = result.stats.charactersRemoved || 0;
          const charsModified = result.stats.charactersModified || 0;
          
          // Use totalChanges if available, otherwise calculate
          changeCount = result.stats.totalChanges || (charsAdded + charsRemoved + charsModified);
          
          if (charsModified > 0) {
            if (charsAdded > 0 || charsRemoved > 0) {
              changeDescription = `${charsModified} characters modified, ${charsRemoved} removed, ${charsAdded} added`;
            } else {
              changeDescription = `${charsModified} characters modified`;
            }
            changeType = 'modified';
          } else if (charsAdded > 0 && charsRemoved > 0) {
            changeDescription = `${charsRemoved} characters removed, ${charsAdded} characters added`;
            changeType = 'modified';
          } else if (charsAdded > 0) {
            changeDescription = `${charsAdded} characters added`;
            changeType = 'added';
          } else if (charsRemoved > 0) {
            changeDescription = `${charsRemoved} characters removed`;
            changeType = 'removed';
          }
        }
      }
      
      // Create one change entry when changes are detected
      if (changeCount > 0) {
        newChanges.push({
          lineNumber: 1,
          type: changeType,
          content: changeDescription,
          originalLineNumber: 1,
          changedLineNumber: 1
        });
      }
      
    } else {
      // Line mode - original logic
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
    }
    
    // Sort changes by line number
    newChanges.sort((a, b) => a.lineNumber - b.lineNumber);
    
    console.log('Collected Changes:', newChanges); // Debug log
    console.log('Diff Mode:', settings.diffMode); // Debug log
    console.log('Result Stats:', result.stats); // Debug log
    
    setChanges(newChanges);
    setCurrentChangeIndex(newChanges.length > 0 ? 0 : -1);
    
    if (newChanges.length > 0) {
      // For word and character modes, show the actual change count from stats
      if (settings.diffMode === 'word' || settings.diffMode === 'char') {
        let actualChangeCount = 0;
        let changeDetails = '';
        
        if (result.stats) {
          if (settings.diffMode === 'word') {
            // Use totalChanges if available for more accurate count
            actualChangeCount = result.stats.totalChanges || 
              ((result.stats.wordsAdded || 0) + (result.stats.wordsRemoved || 0) + (result.stats.wordsModified || 0));
            
            const added = result.stats.wordsAdded || 0;
            const removed = result.stats.wordsRemoved || 0;
            const modified = result.stats.wordsModified || 0;
            
            if (modified > 0) {
              changeDetails = `${modified} modified`;
              if (added > 0 || removed > 0) {
                changeDetails += `, ${added} added, ${removed} removed`;
              }
            } else if (added > 0 && removed > 0) {
              changeDetails = `${added} added, ${removed} removed`;
            } else if (added > 0) {
              changeDetails = `${added} added`;
            } else if (removed > 0) {
              changeDetails = `${removed} removed`;
            }
          } else if (settings.diffMode === 'char') {
            // Use totalChanges if available for more accurate count
            actualChangeCount = result.stats.totalChanges || 
              ((result.stats.charactersAdded || 0) + (result.stats.charactersRemoved || 0) + (result.stats.charactersModified || 0));
            
            const added = result.stats.charactersAdded || 0;
            const removed = result.stats.charactersRemoved || 0;
            const modified = result.stats.charactersModified || 0;
            
            if (modified > 0) {
              changeDetails = `${modified} modified`;
              if (added > 0 || removed > 0) {
                changeDetails += `, ${added} added, ${removed} removed`;
              }
            } else if (added > 0 && removed > 0) {
              changeDetails = `${added} added, ${removed} removed`;
            } else if (added > 0) {
              changeDetails = `${added} added`;
            } else if (removed > 0) {
              changeDetails = `${removed} removed`;
            }
          }
        }
        
        if (actualChangeCount > 0) {
          const unit = settings.diffMode === 'word' ? 'word' : 'character';
          const plural = actualChangeCount !== 1 ? 's' : '';
          showNotification(`Found ${actualChangeCount} ${unit}${plural} changed (${changeDetails})`);
        } else {
          showNotification('Changes detected');
        }
      } else {
        // Line mode - show number of line changes
        showNotification(`Found ${newChanges.length} line${newChanges.length !== 1 ? 's' : ''} changed`);
      }
    } else {
      showNotification('No changes detected');
    }
  }, [showNotification, settings.diffMode]);

  // Main comparison function (defined early to avoid hoisting issues)
  const performComparison = useCallback(() => {
    // Check if both text areas are empty
    if (!originalText.trim() && !changedText.trim()) {
      showNotification('❌ Please enter text in both areas to compare');
      return;
    }
    
    // Check if only one text area has content
    if (!originalText.trim() || !changedText.trim()) {
      showNotification('❌ Please provide text in both Original and Changed areas for comparison');
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
      
      // Store the texts that were just compared
      setLastComparedOriginal(originalText.trim());
      setLastComparedChanged(changedText.trim());
      
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


  // NEW: Simple file loader - size check already done in InputSection.js
const handleFileLoad = async (file, target) => {
  console.log(`🔍 Loading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  
  // Basic validation
  if (!file) {
    showNotification('❌ No file selected');
    return;
  }
  
  if (file.size === 0) {
    showNotification(`❌ File is empty: ${file.name}`);
    alert(`The file appears to be empty: ${file.name}`);
    return;
  }
  
  // File type check
  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  const isText = file.type.startsWith('text/') || 
                 ['.txt', '.md', '.json', '.js', '.html', '.css', '.xml', '.csv'].some(ext => 
                   file.name.toLowerCase().endsWith(ext));
  
  if (!isPDF && !isText) {
    showNotification('❌ Unsupported file type');
    alert(`Unsupported file type: ${file.name}\n\nSupported: .txt, .md, .js, .html, .css, .json, .xml, .csv, .pdf`);
    return;
  }
  
  // Show loading notification
  showNotification(`📁 Loading ${file.name}...`);
  
  try {
    let content = '';
    
    if (isPDF) {
      console.log(`📄 Starting PDF extraction for ${file.name}...`);
      showNotification(`📄 Extracting text from PDF: ${file.name}...`);
      
      const result = await pdfExtractor.current.extractTextFromPDF(file);
      
      if (result.success) {
        content = result.text;
        showNotification(`✅ PDF extracted successfully: ${file.name}`);
        console.log(`✅ PDF extraction completed: ${result.message}`);
      } else {
        showNotification(`❌ PDF extraction failed: ${result.error}`);
        console.error(`❌ PDF extraction error:`, result.error);
        
        // Show alert for PDF extraction failures
        setTimeout(() => {
          alert(`Failed to extract text from PDF: ${file.name}\n\nError: ${result.error}\n\nPlease try a different PDF file.`);
        }, 100);
        
        throw new Error(result.error);
      }
    } else {
      // Handle text files
      console.log(`📄 Reading text file: ${file.name}...`);
      showNotification(`📄 Reading text file: ${file.name}...`);
      
      try {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log(`✅ Text file read successfully`);
            resolve(e.target.result);
          };
          reader.onerror = (e) => {
            console.error(`❌ FileReader error:`, e);
            reject(new Error('Failed to read file - file may be corrupted or in an unsupported format'));
          };
          reader.readAsText(file, 'UTF-8'); // Specify UTF-8 encoding
        });
        
        showNotification(`✅ Text file loaded: ${file.name}`);
      } catch (readError) {
        console.error('Text file reading error:', readError);
        showNotification(`❌ Failed to read file: ${readError.message}`);
        
        // Show alert for text file reading failures
        setTimeout(() => {
          alert(`Failed to read text file: ${file.name}\n\nError: ${readError.message}\n\nPlease check the file format and try again.`);
        }, 100);
        
        throw readError;
      }
    }
    
    // Validate extracted content
    if (!content || content.trim().length === 0) {
      const emptyMessage = `File appears to be empty or contains no readable text: ${file.name}`;
      showNotification(`⚠️ ${emptyMessage}`);
      console.log(`⚠️ Empty content warning: ${emptyMessage}`);
      
      setTimeout(() => {
        alert(`${emptyMessage}\n\nPlease select a file with text content.`);
      }, 100);
      
      throw new Error('Empty file content');
    }
    
    // Check content size after extraction
    const contentSizeKB = (content.length / 1024).toFixed(1);
    console.log(`📊 Extracted content size: ${contentSizeKB}KB`);
    
    // Set the content to the appropriate text area
    if (target === 'original') {
      setOriginalText(content);
      console.log(`✅ Content set to original text area`);
    } else {
      setChangedText(content);
      console.log(`✅ Content set to changed text area`);
    }
    
    // Auto-detect language from filename if enabled
    if (settings.autoDetectLanguage) {
      try {
        const detection = languageDetector.current.autoDetect(content, file.name);
        setDetectedLanguage(detection);
        
        if (detection.language !== 'plaintext') {
          setSettings(prev => ({
            ...prev,
            language: detection.language
          }));
          console.log(`🔍 Language detected: ${detection.language} (${detection.confidence})`);
        }
      } catch (langError) {
        console.error('Language detection error:', langError);
        // Don't show notification for language detection errors - not critical
      }
    }
    
    // Trigger live preview if enabled
    if (settings.livePreview && originalText.trim() && changedText.trim()) {
      performComparison();
    }
    
    // Final success notification
    const finalMessage = isPDF 
      ? `✅ PDF processed: ${file.name} (${contentSizeKB}KB text extracted)`
      : `✅ File loaded: ${file.name} (${contentSizeKB}KB)`;
    
    showNotification(finalMessage);
    console.log(`🎉 File processing completed successfully: ${file.name}`);
    
    return true;
    
  } catch (error) {
    console.error('File processing error:', error);
    const errorMessage = `Failed to process file: ${file.name}`;
    showNotification(`❌ ${errorMessage}`);
    
    // Show detailed error in alert
    setTimeout(() => {
      alert(`${errorMessage}\n\nError Details: ${error.message}\n\nPlease try a different file or contact support if the issue persists.`);
    }, 100);
    
    throw error;
  }
};

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
    
    // Clear last compared texts
    setLastComparedOriginal('');
    setLastComparedChanged('');
    
    showNotification('All content cleared');
  };

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(changedText);
    setChangedText(temp);
    showNotification('Texts swapped');
    
    if (settings.livePreview && originalText.trim() && changedText.trim()) {
      performComparison();
    }
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
    // Check if both text areas are empty
    if (!originalText.trim() && !changedText.trim()) {
      showNotification('❌ Please enter text in both areas to analyze');
      return;
    }
    
    // Check if only one text area has content
    if (!originalText.trim() || !changedText.trim()) {
      showNotification('❌ Please provide text in both Original and Changed areas for AI analysis');
      return;
    }

    // Check if texts have been compared first
    // Ensure current texts match what was last compared
    if (!showResults || !diffResult || 
        originalText.trim() !== lastComparedOriginal || 
        changedText.trim() !== lastComparedChanged) {
      showNotification('❌ Please compare the current texts first before running AI analysis (Ctrl+Enter)');
      return;
    }

    // Check if this analysis type already exists
    const existingAnalysisIndex = aiResults.findIndex(result => result.type === type);
    const isRefreshingExisting = existingAnalysisIndex !== -1;

    setIsGeneratingAI(true);
    try {
      if (groqService.current.isConfigured()) {
        // Use Groq API when configured
        if (isRefreshingExisting) {
          showNotification(`🔄 Refreshing ${type} analysis with Groq...`);
        } else {
          showNotification('Generating AI analysis with Groq...');
        }
        
        const analysis = await groqService.current.generateAnalysis(type, originalText, changedText);
        
        if (isRefreshingExisting) {
          // Replace existing analysis
          setAiResults(prev => prev.map((result, index) => 
            index === existingAnalysisIndex ? analysis : result
          ));
          showNotification(`✅ ${type} analysis refreshed`);
        } else {
          // Add new analysis
          setAiResults(prev => [...prev, analysis]);
          showNotification('✅ Groq AI analysis completed');
        }
        
        setShowAiResults(true);
        
        // Auto-scroll to the latest AI result card
        setTimeout(() => {
          const aiCards = document.querySelectorAll('.ai-analysis-card');
          if (aiCards.length > 0) {
            // Scroll to the last (newest) AI card
            const latestCard = aiCards[aiCards.length - 1];
            latestCard.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 200);
        
      } else {
        // No API configured
        showNotification('❌ Groq API not configured. Please set up your API key.');
        return;
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      showNotification(`❌ Analysis failed: ${error.message}`);
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
    if (settings.livePreview && originalText.trim() && changedText.trim()) {
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
      const isInTextArea = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'enter':
            // Always allow Ctrl+Enter for comparison, even in text areas
            e.preventDefault();
            performComparison();
            showNotification('⌨️ Ctrl+Enter: Comparison started');
            break;
          case 'k':
            // Always allow Ctrl+K for clear all, even in text areas
            e.preventDefault();
            clearAll();
            showNotification('⌨️ Ctrl+K: All content cleared');
            break;
          case 's':
            // Always allow Ctrl+S for swap, even in text areas
            e.preventDefault();
            swapTexts();
            showNotification('⌨️ Ctrl+S: Texts swapped');
            break;
          case 'c':
            // Only prevent default for copy results if we have results and not in text area
            // This allows normal Ctrl+C copy in text areas while still enabling results copy
            if (showResults && !isInTextArea) {
              e.preventDefault();
              copyResults();
              showNotification('⌨️ Ctrl+C: Results copied');
            }
            break;
          case 'd':
            // Always allow theme toggle, even in text areas
            e.preventDefault();
            toggleTheme();
            showNotification('⌨️ Ctrl+D: Theme toggled');
            break;
          case 'h':
            // Always allow contrast toggle, even in text areas
            e.preventDefault();
            toggleContrast();
            showNotification('⌨️ Ctrl+H: Contrast toggled');
            break;
          case 'm':
            // Always allow minimap toggle, even in text areas
            e.preventDefault();
            toggleMinimap();
            showNotification('⌨️ Ctrl+M: Minimap toggled');
            break;
          default:
            break;
        }
      }
      
      // Handle Alt shortcuts for AI tools
      if (e.altKey) {
        switch (e.key) {
          case '1':
            // Alt+1 - Explain
            e.preventDefault();
            generateAIAnalysis('explain');
            showNotification('⌨️ Alt+1: AI Explain started');
            break;
          case '2':
            // Alt+2 - Rewrite
            e.preventDefault();
            generateAIAnalysis('rewrite');
            showNotification('⌨️ Alt+2: AI Rewrite started');
            break;
          case '3':
            // Alt+3 - Summary
            e.preventDefault();
            generateAIAnalysis('summary');
            showNotification('⌨️ Alt+3: AI Summary started');
            break;
          case '4':
            // Alt+4 - Tone
            e.preventDefault();
            generateAIAnalysis('tone');
            showNotification('⌨️ Alt+4: AI Tone analysis started');
            break;
          case '5':
            // Alt+5 - Cleanup
            e.preventDefault();
            generateAIAnalysis('cleanup');
            showNotification('⌨️ Alt+5: AI Cleanup started');
            break;
          default:
            break;
        }
      }
      
      // Handle other shortcuts
      switch (e.key) {
        case 'Escape':
          // Always allow Escape to clear AI results
          if (showAiResults) {
            clearAIResults();
            showNotification('⌨️ Escape: AI results cleared');
          }
          break;
        case 'ArrowUp':
          // Only allow navigation shortcuts when not typing in text areas
          if (e.ctrlKey && !isInTextArea) {
            e.preventDefault();
            navigateToPreviousChange();
          }
          break;
        case 'ArrowDown':
          // Only allow navigation shortcuts when not typing in text areas
          if (e.ctrlKey && !isInTextArea) {
            e.preventDefault();
            navigateToNextChange();
          }
          break;
        case 'F1':
          // Always allow F1 for help, even in text areas
          e.preventDefault();
          if (userGuide.current) {
            userGuide.current.showQuickGuide();
            showNotification('⌨️ F1: Quick guide opened');
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, showAiResults, performComparison, clearAll, swapTexts, copyResults, toggleTheme, toggleContrast, toggleMinimap, clearAIResults, navigateToPreviousChange, navigateToNextChange, generateAIAnalysis, showNotification]);

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
          showNotification={showNotification}
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