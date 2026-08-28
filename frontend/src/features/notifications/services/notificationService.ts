import axios from 'axios';

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title?: string;
  message: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/notifications`;

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
