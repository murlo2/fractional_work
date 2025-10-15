import React, { useState } from 'react';
import PlayerDetail from './PlayerDetail';
import './PlayerCard.css';

const PlayerCard = ({ player, onPlayerUpdate }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleCardClick = () => {
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  return (
    <>
      <div className="player-card" onClick={handleCardClick}>
        <div className="player-header">
          <h3 className="player-name">{player.name}</h3>
        </div>
        <div className="player-position">{player.position}</div>
        <div className="player-stats">
          <div className="stat">
            <span className="stat-label">Hits:</span>
            <span className="stat-value">{player.hits}</span>
          </div>
          <div className="stat">
            <span className="stat-label">HRs:</span>
            <span className="stat-value">{player.home_runs}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Avg:</span>
            <span className="stat-value">{player.batting_average?.toFixed(3) || 'N/A'}</span>
          </div>
          <div className="stat">
            <span className="stat-label">RBI:</span>
            <span className="stat-value">{player.rbi}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Runs:</span>
            <span className="stat-value">{player.runs}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Games:</span>
            <span className="stat-value">{player.games}</span>
          </div>
          <div className="stat">
            <span className="stat-label">H/G:</span>
            <span className="stat-value">{player.hits_per_game?.toFixed(3) || 'N/A'}</span>
          </div>
        </div>
        <div className="click-hint">Click to view details</div>
      </div>

      {showDetail && (
        <PlayerDetail
          player={player}
          onClose={handleCloseDetail}
          onPlayerUpdate={onPlayerUpdate}
        />
      )}
    </>
  );
};

export default PlayerCard;
