import axios from 'axios';
import type { Item } from '../../items/services/itemService';

const API_URL = 'http://localhost:5010/api/claims';

export interface Answer {
  questionId: string;
  answer: string;
}

export interface Claim {
  _id: string;
  item: Item;
  claimant: {
    _id: string;
    name: string;
    email: string;
  };
  status:
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'needs_info'
  | 'completed';
  verificationScore: number | null;
  answers: Answer[];
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewNotes?: string;
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

export const createClaim = async (
  itemId: string,
  answers?: Answer[]
): Promise<ApiResponse<Claim>> => {
  const response = await axios.post<ApiResponse<Claim>>(
    API_URL,
    { itemId, answers },
    getAuthHeaders()
  );

  return response.data;
};

export const getClaims = async (): Promise<ApiResponse<Claim[]>> => {
  const response = await axios.get<ApiResponse<Claim[]>>(
    API_URL,
    getAuthHeaders()
  );

  return response.data;
};

export const getClaimById = async (
  id: string
): Promise<ApiResponse<Claim>> => {
  const response = await axios.get<ApiResponse<Claim>>(
    `${API_URL}/${id}`,
    getAuthHeaders()
  );

  return response.data;
};

export const submitVerification = async (
  id: string,
  answers: Answer[]
): Promise<ApiResponse<Claim>> => {
  const response = await axios.post<ApiResponse<Claim>>(
    `${API_URL}/${id}/verify`,
    { answers },
    getAuthHeaders()
  );

  return response.data;
};

export const reviewClaim = async (
  id: string,
  status: 'approved' | 'rejected' | 'needs_info',
  reviewNotes?: string
): Promise<ApiResponse<Claim>> => {
  const response = await axios.put<ApiResponse<Claim>>(
    `${API_URL}/${id}/review`,
    { status, reviewNotes },
    getAuthHeaders()
  );

  return response.data;
};

export const confirmReturn = async (
  id: string
): Promise<ApiResponse<Claim>> => {
  const response = await axios.post<ApiResponse<Claim>>(
    `${API_URL}/${id}/confirm-return`,
    {},
    getAuthHeaders()
  );

  return response.data;
};