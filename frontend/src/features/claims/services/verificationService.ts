import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/claims`;

export interface VerificationQuestion {
  _id: string;
  question: string;
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

export const getVerificationQuestions = async (itemId: string): Promise<ApiResponse<VerificationQuestion[]>> => {
  const response = await axios.get<ApiResponse<VerificationQuestion[]>>(
    `${API_URL}/item/${itemId}/questions`,
    getAuthHeaders()
  );
  return response.data;
};
