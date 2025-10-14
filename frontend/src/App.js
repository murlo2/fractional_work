import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import PlayerList from './components/PlayerList';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <div className="app-header">
          <h1 className="app-title">🏟️ Baseball Stats</h1>
          <ThemeToggle />
        </div>
        <PlayerList />
      </div>
    </ThemeProvider>
  );
}

export default App;
