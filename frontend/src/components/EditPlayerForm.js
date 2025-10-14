import React, { useState } from 'react';
import { playerService } from '../services/api';
import './EditPlayerForm.css';

const EditPlayerForm = ({ player, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: player.name || '',
    position: player.position || '',
    games: player.games || 0,
    at_bat: player.at_bat || 0,
    runs: player.runs || 0,
    hits: player.hits || 0,
    double_2b: player.double_2b || 0,
    third_baseman: player.third_baseman || 0,
    home_runs: player.home_runs || 0,
    rbi: player.rbi || 0,
    walks: player.walks || 0,
    strikeouts: player.strikeouts || 0,
    stolen_bases: player.stolen_bases || 0,
    caught_stealing: player.caught_stealing || 0,
    batting_average: player.batting_average || 0,
    on_base_percentage: player.on_base_percentage || 0,
    slugging_percentage: player.slugging_percentage || 0,
    on_base_plus_slugging: player.on_base_plus_slugging || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['games', 'at_bat', 'runs', 'hits', 'double_2b', 'third_baseman', 
               'home_runs', 'rbi', 'walks', 'strikeouts', 'stolen_bases', 'caught_stealing'].includes(name) ? 
              (value === '' ? '' : parseInt(value) || 0) :
              ['batting_average', 'on_base_percentage', 'slugging_percentage', 'on_base_plus_slugging'].includes(name) ? 
              (value === '' ? '' : parseFloat(value) || 0) :
              value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Updating player:', player.id, 'with data:', formData);
      const response = await playerService.updatePlayer(player.id, formData);
      console.log('Update response:', response.data);
      setSuccess(true);
      setError(null);
      // Close the form after a short delay to show success message
      setTimeout(() => {
        onSave(response.data);
      }, 1000);
    } catch (err) {
      console.error('Error updating player:', err);
      setError(`Failed to update player: ${err.response?.data?.error || err.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-form-overlay">
      <div className="edit-form-content">
        <div className="edit-form-header">
          <h3>Edit Player</h3>
          <button className="close-edit-button" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="games">Games</label>
              <input
                type="number"
                id="games"
                name="games"
                value={formData.games}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="at_bat">At Bats</label>
              <input
                type="number"
                id="at_bat"
                name="at_bat"
                value={formData.at_bat}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="runs">Runs</label>
              <input
                type="number"
                id="runs"
                name="runs"
                value={formData.runs}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="hits">Hits</label>
              <input
                type="number"
                id="hits"
                name="hits"
                value={formData.hits}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="double_2b">Doubles</label>
              <input
                type="number"
                id="double_2b"
                name="double_2b"
                value={formData.double_2b}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="third_baseman">Triples</label>
              <input
                type="number"
                id="third_baseman"
                name="third_baseman"
                value={formData.third_baseman}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="home_runs">Home Runs</label>
              <input
                type="number"
                id="home_runs"
                name="home_runs"
                value={formData.home_runs}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="rbi">RBI</label>
              <input
                type="number"
                id="rbi"
                name="rbi"
                value={formData.rbi}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="walks">Walks</label>
              <input
                type="number"
                id="walks"
                name="walks"
                value={formData.walks}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="strikeouts">Strikeouts</label>
              <input
                type="number"
                id="strikeouts"
                name="strikeouts"
                value={formData.strikeouts}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stolen_bases">Stolen Bases</label>
              <input
                type="number"
                id="stolen_bases"
                name="stolen_bases"
                value={formData.stolen_bases}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="caught_stealing">Caught Stealing</label>
              <input
                type="number"
                id="caught_stealing"
                name="caught_stealing"
                value={formData.caught_stealing}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batting_average">Batting Average</label>
              <input
                type="number"
                id="batting_average"
                name="batting_average"
                value={formData.batting_average}
                onChange={handleInputChange}
                min="0"
                max="1"
                step="0.001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="on_base_percentage">On-Base Percentage</label>
              <input
                type="number"
                id="on_base_percentage"
                name="on_base_percentage"
                value={formData.on_base_percentage}
                onChange={handleInputChange}
                min="0"
                max="1"
                step="0.001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="slugging_percentage">Slugging Percentage</label>
              <input
                type="number"
                id="slugging_percentage"
                name="slugging_percentage"
                value={formData.slugging_percentage}
                onChange={handleInputChange}
                min="0"
                max="3"
                step="0.001"
              />
            </div>
            <div className="form-group">
              <label htmlFor="on_base_plus_slugging">OPS</label>
              <input
                type="number"
                id="on_base_plus_slugging"
                name="on_base_plus_slugging"
                value={formData.on_base_plus_slugging}
                onChange={handleInputChange}
                min="0"
                max="4"
                step="0.001"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ Player updated successfully!
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerForm;
