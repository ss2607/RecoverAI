import axios from 'axios';

const API_URL = '/api/items';

export interface Item {
  _id: string;
  organization?: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  dateLostFound: string;
  images: string[];
  aiTags: string[];
  status: 'open' | 'matched' | 'claimed' | 'returned' | 'closed';
  reportedBy: string | { _id: string, name: string, email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ItemPayload {
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: string;
  color?: string;
  brand?: string;
  location: string;
  dateLostFound: string;
  images?: string[];
  status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getItems = async (): Promise<any> => {
  const response = await axios.get<ApiResponse<Item[]>>(API_URL);
  return response.data.data;
};

export const getItemById = async (id: string): Promise<any> => {
  const response = await axios.get<ApiResponse<Item>>(`${API_URL}/${id}`);
  return response.data.data;
};

export const createItem = async (data: ItemPayload): Promise<any> => {
  const response = await axios.post<ApiResponse<Item>>(API_URL, data);
  return response.data.data;
};

export const updateItem = async (id: string, data: Partial<ItemPayload>): Promise<any> => {
  const response = await axios.put<ApiResponse<Item>>(`${API_URL}/${id}`, data);
  return response.data.data;
};

export const deleteItem = async (id: string): Promise<any> => {
  const response = await axios.delete<ApiResponse<Item>>(`${API_URL}/${id}`);
  return response.data.data;
};
