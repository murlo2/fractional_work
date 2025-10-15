import React, { useState, useEffect, useCallback } from 'react';
import { playerService } from '../services/api';
import PlayerCard from './PlayerCard';
import './PlayerList.css';

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('hits');
  const [order, setOrder] = useState('desc');

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await playerService.getPlayers(sortBy, order);
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, order]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setOrder('desc');
    }
  };

  const handleSeedDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will DELETE ALL your edited player data and reset to original API data.\n\n' +
      'Are you sure you want to continue?'
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      setLoading(true);
      await playerService.seedDatabase();
      await fetchPlayers();
    } catch (err) {
      setError('Failed to seed database');
      console.error('Error seeding database:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchPlayers} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="player-list-container">
      <div className="controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <button
              className={`sort-button ${sortBy === 'hits' ? 'active' : ''}`}
              onClick={() => handleSortChange('hits')}
            >
              Hits {sortBy === 'hits' && (order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-button ${sortBy === 'home_runs' ? 'active' : ''}`}
              onClick={() => handleSortChange('home_runs')}
            >
              Home Runs {sortBy === 'home_runs' && (order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-button ${sortBy === 'batting_average' ? 'active' : ''}`}
              onClick={() => handleSortChange('batting_average')}
            >
              Batting Avg {sortBy === 'batting_average' && (order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => handleSortChange('name')}
            >
              Name {sortBy === 'name' && (order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`sort-button ${sortBy === 'hits_per_game' ? 'active' : ''}`}
              onClick={() => handleSortChange('hits_per_game')}
            >
              Hits/Game {sortBy === 'hits_per_game' && (order === 'desc' ? '↓' : '↑')}
            </button>
          </div>
            <button onClick={handleSeedDatabase} className="seed-button">
              ⚠️ Reset to Original Data
            </button>
        </div>

      <div className="players-grid">
        {players.length === 0 ? (
          <div className="no-players">
            <p>No players found. Click "Load Data from API" to populate the database.</p>
          </div>
        ) : (
          players.map((player) => (
            <PlayerCard key={player.id} player={player} onPlayerUpdate={fetchPlayers} />
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerList;
