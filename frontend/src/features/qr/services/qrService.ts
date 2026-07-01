import axios from 'axios';

const API_URL = '/api/qr';

export const qrService = {
  generateLink: async (token: string, itemId: string) => {
    const response = await axios.post(`${API_URL}/generate`, { itemId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  scanCode: async (code: string) => {
    const response = await axios.get(`${API_URL}/${code}`);
    return response.data;
  }
};
