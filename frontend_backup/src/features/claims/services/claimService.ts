import axios from 'axios';
import { Item } from '../../items/services/itemService';

const API_URL = '/api/claims';

export interface Answer {
  questionId: string;
  answer: string;
}

export interface Claim {
  _id: string;
  item: Item;
  claimant: { _id: string, name: string, email: string };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  verificationScore: number | null;
  answers: Answer[];
  reviewedBy?: { _id: string, name: string };
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createClaim = async (itemId: string): Promise<ApiResponse<Claim>> => {
  const response = await axios.post<ApiResponse<Claim>>(API_URL, { itemId });
  return response.data;
};

export const getClaims = async (): Promise<ApiResponse<Claim[]>> => {
  const response = await axios.get<ApiResponse<Claim[]>>(API_URL);
  return response.data;
};

export const getClaimById = async (id: string): Promise<ApiResponse<Claim>> => {
  const response = await axios.get<ApiResponse<Claim>>(`${API_URL}/${id}`);
  return response.data;
};

export const submitVerification = async (id: string, answers: Answer[]): Promise<ApiResponse<Claim>> => {
  const response = await axios.post<ApiResponse<Claim>>(`${API_URL}/${id}/verify`, { answers });
  return response.data;
};

export const reviewClaim = async (id: string, status: 'approved' | 'rejected', reviewNotes?: string): Promise<ApiResponse<Claim>> => {
  const response = await axios.put<ApiResponse<Claim>>(`${API_URL}/${id}/review`, { status, reviewNotes });
  return response.data;
};
