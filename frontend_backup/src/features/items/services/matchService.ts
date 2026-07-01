import axios from 'axios';
import { Item } from './itemService';

const API_URL = '/api/matches';

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

export const getMatches = async (): Promise<ApiResponse<Match[]>> => {
  const response = await axios.get<ApiResponse<Match[]>>(API_URL);
  return response.data;
};

export const getMatchById = async (id: string): Promise<ApiResponse<Match>> => {
  const response = await axios.get<ApiResponse<Match>>(`${API_URL}/${id}`);
  return response.data;
};

export const getMatchesByItemId = async (itemId: string): Promise<ApiResponse<Match[]>> => {
  const response = await axios.get<ApiResponse<Match[]>>(`${API_URL}/item/${itemId}`);
  return response.data;
};

export const deleteMatch = async (id: string): Promise<ApiResponse<Match>> => {
  const response = await axios.delete<ApiResponse<Match>>(`${API_URL}/${id}`);
  return response.data;
};
