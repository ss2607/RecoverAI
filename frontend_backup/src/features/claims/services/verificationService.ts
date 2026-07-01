import axios from 'axios';

const API_URL = '/api/claims';

export interface VerificationQuestion {
  _id: string;
  question: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getVerificationQuestions = async (itemId: string): Promise<ApiResponse<VerificationQuestion[]>> => {
  const response = await axios.get<ApiResponse<VerificationQuestion[]>>(`${API_URL}/item/${itemId}/questions`);
  return response.data;
};
