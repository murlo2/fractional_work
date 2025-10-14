import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const playerService = {
  // Get all players with optional sorting
  getPlayers: (sortBy = 'hits', order = 'desc') => {
    return api.get(`/players?sort_by=${sortBy}&order=${order}`);
  },

  // Get a specific player
  getPlayer: (id) => {
    return api.get(`/players/${id}`);
  },

  // Update a player
  updatePlayer: (id, data) => {
    return api.put(`/players/${id}`, data);
  },

  // Get player description
  getDescription: (id) => {
    return api.get(`/players/${id}/description`);
  },

  // Generate player description
  generateDescription: (id) => {
    return api.post(`/players/${id}/description`);
  },

  // Save player description
  saveDescription: (id, description) => {
    return api.put(`/players/${id}/description`, { description });
  },

  // Seed database
  seedDatabase: () => {
    return api.post('/seed');
  },

  // Health check
  healthCheck: () => {
    return api.get('/health');
  },
};

export default api;
