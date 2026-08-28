import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/profile`;

export const profileService = {
  getProfile: async (token: string) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  updateProfile: async (token: string, data: any) => {
    const response = await axios.put(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  changePassword: async (token: string, oldPassword: string, newPassword: string) => {
    const response = await axios.put(`${API_URL}/change-password`, { oldPassword, newPassword }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
