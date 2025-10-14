import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, setSpecificTheme } = useTheme();

  const getThemeIcon = (themeName) => {
    switch (themeName) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'neon':
        return '⚡';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = (themeName) => {
    switch (themeName) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'neon':
        return 'Neon';
      default:
        return 'Light';
    }
  };

  return (
    <div className="theme-toggle">
      <div className="theme-options">
        {['light', 'dark', 'neon'].map((themeName) => (
          <button
            key={themeName}
            className={`theme-option ${theme === themeName ? 'active' : ''}`}
            onClick={() => setSpecificTheme(themeName)}
            title={`Switch to ${getThemeLabel(themeName)} theme`}
          >
            <span className="theme-icon">{getThemeIcon(themeName)}</span>
            <span className="theme-label">{getThemeLabel(themeName)}</span>
          </button>
        ))}
      </div>
      <button 
        className="theme-cycle-button"
        onClick={toggleTheme}
        title="Cycle through themes"
      >
        <span className="cycle-icon">🔄</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
