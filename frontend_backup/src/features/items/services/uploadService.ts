import axios from 'axios';

const API_URL = '/api/uploads';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadImage = async (file: File, onProgress?: (progressEvent: any) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post<UploadResponse>(`${API_URL}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });

  return response.data;
};
