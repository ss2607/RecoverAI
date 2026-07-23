import axios from 'axios';

const API_URL = 'http://localhost:5010/api/ai';

export interface ImageAnalysisData {
  category: string;
  color: string;
  brand: string;
  condition: string;
  description: string;
  tags: string[];
}

interface AnalysisResponse {
  statusCode: number;
  message: string;
  data: ImageAnalysisData;
}

export const analyzeImageUrl = async (
  imageUrl: string
): Promise<AnalysisResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.post<AnalysisResponse>(
    `${API_URL}/analyze-image`,
    { imageUrl },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log("===== AI SERVICE =====");
  console.log(response.data);

  return response.data;
};