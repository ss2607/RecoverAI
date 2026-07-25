import axios from 'axios';
import type { Item } from './itemService';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/matches`;

export interface Match {
  _id: string;
  lostItem: Item;
  foundItem: Item;
  confidenceScore: number;
  matchedFields: string[];
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMatches = async (): Promise<any> => {
  const response = await axios.get<ApiResponse<Match[]>>(API_URL, getAuthHeaders());
  return response.data.data;
};

export const getMatchById = async (id: string): Promise<any> => {
  const response = await axios.get<ApiResponse<Match>>(`${API_URL}/${id}`, getAuthHeaders());
  return response.data.data;
};

export const getMatchesByItemId = async (itemId: string): Promise<any> => {
  const response = await axios.get<ApiResponse<Match[]>>(`${API_URL}/item/${itemId}`, getAuthHeaders());
  return response.data.data;
};

export const deleteMatch = async (id: string): Promise<any> => {
  const response = await axios.delete<ApiResponse<Match>>(`${API_URL}/${id}`, getAuthHeaders());
  return response.data.data;
};
