import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Grid } from '@mui/material';
import { uploadImage } from '../services/uploadService';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadRemove: (url: string) => void;
  uploadedUrls?: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadSuccess,
  onUploadRemove,
  uploadedUrls = []
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
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i]);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        await processFile(files[i]);
      }
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

      if ((response.statusCode === 200 || response.statusCode === 201) && response.data?.url) {
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

  return (
    <Box sx={{ mt: 2 }}>
      {/* Uploaded Previews Grid */}
      {uploadedUrls.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            {uploadedUrls.map((url, idx) => (
              <Grid item xs={6} sm={4} key={idx}>
                <Box sx={{ position: 'relative', width: '100%', height: 100, border: '1px solid #E7DDD1', borderRadius: 1, overflow: 'hidden' }}>
                  <Box 
                    component="img" 
                    src={url} 
                    alt={`Uploaded item ${idx + 1}`} 
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => onUploadRemove(url)}
                  >
                    <Typography variant="caption" color="error" fontWeight="bold" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>✕</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Drop Zone */}
      {isUploading ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
            borderColor: 'divider',
            position: 'relative'
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>{progress}%</Typography>
          </Box>
        </Paper>
      ) : (
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
            multiple
            onChange={handleFileInput}
          />
          <Box>
            <Typography variant="body1" gutterBottom sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Drag & drop images here, or click to browse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG, WEBP up to 5MB
            </Typography>
          </Box>
        </Paper>
      )}

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
