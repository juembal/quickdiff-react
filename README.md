# QuickDiff React

A React version of the QuickDiff text comparison tool with advanced features including multiple diff modes, AI analysis, and comprehensive export options.

## Features

- **Multiple Diff Modes**: Line-by-line, word-by-word, and character-level comparison
- **Export Options**: Copy, TXT, HTML, Markdown, and PDF export
- **AI Analysis**: Intelligent text analysis with explanations, rewrite suggestions, summaries, tone analysis, and cleanup recommendations
- **Syntax Highlighting**: Support for multiple programming languages
- **Dark/Light Mode**: Theme toggle with persistence
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Live Preview**: Auto-compare with debouncing
- **Accessibility**: High contrast mode and keyboard shortcuts
- **Drag & Drop**: File upload support
- **Navigation**: Change navigation with minimap

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

4. **Start comparing:**
   - Paste or type text in the two comparison areas
   - Choose your diff mode and view preferences
   - Use AI analysis features for deeper insights
   - Export results in your preferred format

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
quickdiff-react/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── SettingsPanel.js
│   │   ├── InputSection.js
│   │   ├── Controls.js
│   │   ├── Legend.js
│   │   ├── Results.js
│   │   ├── ChangeSummary.js
│   │   ├── DiffView.js
│   │   ├── AIResults.js
│   │   ├── Minimap.js
│   │   └── NotificationProvider.js
│   ├── utils/
│   │   ├── DiffEngine.js
│   │   ├── ExportUtils.js
│   │   └── AIEngine.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Key Components

### DiffEngine
Handles all text comparison logic including:
- Line-by-line comparison using LCS algorithm
- Word-by-word comparison with highlighting
- Character-level comparison
- Text preprocessing (ignore case, whitespace, punctuation)

### ExportUtils
Manages export functionality:
- Copy to clipboard
- Export to TXT, HTML, Markdown, PDF
- Fallback PDF export using print dialog

### AIEngine
Provides intelligent text analysis:
- Text explanations and statistics
- Rewrite suggestions
- Content summaries
- Tone analysis
- Text cleanup recommendations

## Keyboard Shortcuts

- `Ctrl+Enter` - Compare texts
- `Ctrl+K` - Clear all content
- `Ctrl+S` - Swap texts
- `Ctrl+C` - Copy results (when results are visible)
- `Ctrl+D` - Toggle dark/light theme
- `Ctrl+H` - Toggle high contrast mode
- `Ctrl+M` - Toggle minimap
- `Ctrl+↑/↓` - Navigate between changes
- `Escape` - Clear AI results
- `Alt+1-5` - Quick AI analysis shortcuts

## Customization

### Themes
The app supports light and dark themes with a 4-color palette:
- `#F2F2F2` (Light Gray)
- `#EAE4D5` (Warm Gray)
- `#B6B09F` (Medium Gray)
- `#000000` (Black)

### Settings
All user preferences are automatically saved to localStorage:
- Diff mode preferences
- View mode settings
- Ignore options
- Theme and contrast preferences
- Live preview settings

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Dependencies

- React 18.2+
- jsPDF 2.5+ (for PDF export)
- highlight.js 11.9+ (for syntax highlighting)

## Performance

The app is optimized for performance with:
- Debounced live preview
- Efficient diff algorithms
- Lazy loading of heavy components
- Optimized re-renders with React hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see the original QuickDiff project for details.

## Differences from Original

This React version includes:
- Modern React 18 with hooks
- Component-based architecture
- Improved state management
- Enhanced accessibility
- Better mobile responsiveness
- Optimized performance
- Cleaner code organization

## Troubleshooting

### PDF Export Issues
If PDF export doesn't work:
1. Ensure jsPDF is loaded
2. Try the fallback print-to-PDF option
3. Check browser console for errors

### Performance Issues
If the app feels slow:
1. Disable live preview for large texts
2. Use line-by-line mode for better performance
3. Clear browser cache and reload

### Theme Issues
If themes don't persist:
1. Check if localStorage is enabled
2. Clear browser data and try again
3. Ensure JavaScript is enabled