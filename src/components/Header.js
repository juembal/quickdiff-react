import React from 'react';

const Header = ({ onThemeToggle, onContrastToggle }) => {
  return (
    <header className="header">
      <div className="title-section">
        <h1>⚡ QuickDiff</h1>
        <p>Fast text comparison tool</p>
      </div>
      <div className="header-controls">
        <button 
          className="btn btn-secondary btn-icon-only" 
          onClick={onContrastToggle}
          title="Toggle High Contrast"
        >
          🔆
        </button>
        <button 
          className="btn btn-secondary btn-icon-only" 
          onClick={onThemeToggle}
          title="Toggle Dark/Light Mode"
        >
          🌓
        </button>
        {/* User guide help button (❓) will be automatically added here by user-guide.js */}
      </div>
    </header>
  );
};

export default Header;