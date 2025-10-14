import React, { useState, useEffect, useCallback } from 'react';
import { playerService } from '../services/api';
import EditPlayerForm from './EditPlayerForm';
import './PlayerDetail.css';

const PlayerDetail = ({ player, onClose, onPlayerUpdate }) => {
  const [description, setDescription] = useState('');
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(player);
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadDescription = useCallback(async () => {
    try {
      setLoadingDescription(true);
      const response = await playerService.getDescription(currentPlayer.id);
      setDescription(response.data.description || '');
    } catch (err) {
      console.error('Error loading description:', err);
      setDescription('');
    } finally {
      setLoadingDescription(false);
      setIsInitialLoad(false); // Mark initial load as complete
    }
  }, [currentPlayer.id]);

  const generateDescription = useCallback(async (forceRegenerate = false) => {
    // Only generate if no description exists or if forced
    if (!forceRegenerate && description) {
      return;
    }
    
    try {
      setLoadingDescription(true);
      const response = await playerService.generateDescription(currentPlayer.id);
      setDescription(response.data.description);
      setDescriptionChanged(false); // Reset changed flag since it's auto-saved
    } catch (err) {
      console.error('Error generating description:', err);
      setDescription('Unable to generate description at this time.');
    } finally {
      setLoadingDescription(false);
    }
  }, [currentPlayer.id, description]);

  const saveDescription = useCallback(async () => {
    try {
      setSavingDescription(true);
      await playerService.saveDescription(currentPlayer.id, description);
      setDescriptionChanged(false);
    } catch (err) {
      console.error('Error saving description:', err);
      alert('Failed to save description. Please try again.');
    } finally {
      setSavingDescription(false);
    }
  }, [currentPlayer.id, description]);

  useEffect(() => {
    // Load existing description when component mounts
    loadDescription();
  }, [loadDescription]);

  // Auto-generate description if none exists after initial load only
  useEffect(() => {
    if (!loadingDescription && !description && isInitialLoad) {
      generateDescription();
    }
  }, [loadingDescription, description, isInitialLoad, generateDescription]);

  const handlePlayerUpdate = (updatedPlayer) => {
    console.log('Player updated:', updatedPlayer);
    setCurrentPlayer(updatedPlayer);
    setShowEditForm(false);
    
    // Preserve the existing description when updating player stats
    // The description should remain unchanged unless explicitly regenerated
    if (updatedPlayer.description && updatedPlayer.description !== description) {
      setDescription(updatedPlayer.description);
    }
    
    // Don't automatically regenerate description - let user decide
    // Notify parent component to refresh the player list
    if (onPlayerUpdate) {
      onPlayerUpdate();
    }
  };

  const handleRegenerateDescription = () => {
    generateDescription(true); // Force regenerate
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionChanged(true);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowEditForm(true);
  };

  const handleCloseEdit = () => {
    setShowEditForm(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{currentPlayer.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="player-detail-content">
          <div className="player-info">
            <div className="info-row">
              <span className="label">Position:</span>
              <span className="value">{currentPlayer.position}</span>
            </div>
            <div className="info-row">
              <span className="label">Age:</span>
              <span className="value">{currentPlayer.age || 'N/A'}</span>
            </div>
          </div>

          <div className="player-stats-detail">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Games</span>
                <span className="stat-value">{currentPlayer.games}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">At Bats</span>
                <span className="stat-value">{currentPlayer.at_bat}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Runs</span>
                <span className="stat-value">{currentPlayer.runs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Hits</span>
                <span className="stat-value">{currentPlayer.hits}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Doubles</span>
                <span className="stat-value">{currentPlayer.double_2b}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Triples</span>
                <span className="stat-value">{currentPlayer.third_baseman}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Home Runs</span>
                <span className="stat-value">{currentPlayer.home_runs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">RBI</span>
                <span className="stat-value">{currentPlayer.rbi}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Walks</span>
                <span className="stat-value">{currentPlayer.walks}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Strikeouts</span>
                <span className="stat-value">{currentPlayer.strikeouts}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Stolen Bases</span>
                <span className="stat-value">{currentPlayer.stolen_bases}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Caught Stealing</span>
                <span className="stat-value">{currentPlayer.caught_stealing}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Batting Average</span>
                <span className="stat-value">{currentPlayer.batting_average?.toFixed(3) || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">On-Base %</span>
                <span className="stat-value">{currentPlayer.on_base_percentage?.toFixed(3) || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Slugging %</span>
                <span className="stat-value">{currentPlayer.slugging_percentage?.toFixed(3) || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">OPS</span>
                <span className="stat-value">{currentPlayer.on_base_plus_slugging?.toFixed(3) || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="player-description">
            <div className="description-header">
              <h3>Player Description</h3>
              <div className="description-actions">
                {!loadingDescription && (
                  <button 
                    className="regenerate-button"
                    onClick={handleRegenerateDescription}
                    title="Generate a new description"
                  >
                    🔄 Regenerate
                  </button>
                )}
                {descriptionChanged && (
                  <button 
                    className="save-button"
                    onClick={saveDescription}
                    disabled={savingDescription}
                    title="Save description changes"
                  >
                    {savingDescription ? '💾 Saving...' : '💾 Save'}
                  </button>
                )}
              </div>
            </div>
            {loadingDescription ? (
              <div className="loading-description">
                <div className="spinner-small"></div>
                <span>Generating description...</span>
              </div>
            ) : (
              <textarea
                className="description-textarea"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="No description available. Click 'Regenerate' to generate one."
                rows={6}
              />
            )}
          </div>

          <div className="modal-actions">
            <button className="edit-button" onClick={handleEditClick}>
              Edit Player
            </button>
            <button className="close-modal-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {showEditForm && (
          <EditPlayerForm
            player={currentPlayer}
            onSave={handlePlayerUpdate}
            onCancel={handleCloseEdit}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerDetail;
