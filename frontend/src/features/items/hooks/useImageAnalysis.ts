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

      console.log("===== HOOK RESPONSE =====");
      console.log(response);

      if (
        (response.statusCode === 200 || response.statusCode === 201) &&
        response.data
      ) {
        console.log("===== HOOK DATA =====");
        console.log(response.data);

        setAnalysisResult(response.data);
        return response.data;
      }

      setError(response.message || "Analysis failed");
      return null;
    } catch (err: any) {
      console.error(err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during analysis";

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
