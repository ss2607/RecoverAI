import { useState } from 'react';
import { analyzeImageUrl } from '../services/aiService';
import type { ImageAnalysisData } from '../services/aiService';

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageUrl: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await analyzeImageUrl(imageUrl);

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        return response.data;
      } else {
        setError(response.message || 'Analysis failed');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during analysis';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return {
    analyzeImage,
    isAnalyzing,
    analysisResult,
    clearAnalysis,
    error
  };
};
