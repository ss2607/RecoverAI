import axios from 'axios';

const API_URL = '/api/ai';

export interface ImageAnalysisData {
  category: string;
  color: string;
  brand: string;
  condition: string;
  tags: string[];
}

interface AnalysisResponse {
  success: boolean;
  message: string;
  data: ImageAnalysisData;
}

export const analyzeImageUrl = async (imageUrl: string): Promise<AnalysisResponse> => {
  const response = await axios.post<AnalysisResponse>(`${API_URL}/analyze-image`, { imageUrl });
  return response.data;
};
