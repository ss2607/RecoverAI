import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/auth`;

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  },

  getMe: async (token: string) => {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
