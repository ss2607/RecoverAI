import axios from 'axios';

const API_URL = '/api/notifications';

export const notificationService = {
  getNotifications: async (token: string) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  markAsRead: async (token: string, id: string) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
