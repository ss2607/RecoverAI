import axios from 'axios';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

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
