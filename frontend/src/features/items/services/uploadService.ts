import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5010';
const API_URL = `${BASE_URL}/api/uploads`;

interface UploadResponse {
  statusCode: number;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadImage = async (file: File, onProgress?: (progressEvent: any) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('token');

  const response = await axios.post<UploadResponse>(`${API_URL}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: onProgress,
  });

  return response.data;
};
