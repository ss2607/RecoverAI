import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { uploadImage } from '../services/uploadService';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadRemove: (url: string) => void;
  uploadedUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadRemove,
  uploadedUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size is 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);
      
      const response = await uploadImage(file, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      if (response.success && response.data?.url) {
        onUploadSuccess(response.data.url);
      } else {
        setError(response.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    if (uploadedUrl) {
      onUploadRemove(uploadedUrl);
    }
  };

  if (uploadedUrl) {
    return (
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mt: 2 }}>
        <Box 
          component="img" 
          src={uploadedUrl} 
          alt="Uploaded item" 
          sx={{ width: '100%', borderRadius: 1, display: 'block' }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
          onClick={handleRemove}
        >
          <Typography variant="body2" color="error" fontWeight="bold">X</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper
        variant="outlined"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : error ? 'error.main' : 'divider',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => document.getElementById('image-upload-input')?.click()}
      >
        <input
          type="file"
          id="image-upload-input"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
        
        {isUploading ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>{progress}%</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Drag and drop an image here, or click to select
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG, WEBP up to 5MB
            </Typography>
          </Box>
        )}
      </Paper>
      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
