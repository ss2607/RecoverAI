import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/admin`;

export const adminService = {
  getStats: async (token: string) => {
    const response = await axios.get(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  getUsers: async (token: string) => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  getClaims: async (token: string) => {
    const response = await axios.get(`${API_URL}/claims`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
