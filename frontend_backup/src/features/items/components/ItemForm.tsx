import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Grid, 
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ItemPayload } from '../services/itemService';
import { ImageUploader } from './ImageUploader';
import { useImageAnalysis } from '../hooks/useImageAnalysis';

interface ItemFormProps {
  initialData?: ItemPayload;
  onSubmit: (data: ItemPayload) => Promise<void>;
  isLoading: boolean;
}

export const ItemForm: React.FC<ItemFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ItemPayload>({
    type: initialData?.type || 'lost',
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    color: initialData?.color || '',
    brand: initialData?.brand || '',
    location: initialData?.location || '',
    dateLostFound: initialData?.dateLostFound ? new Date(initialData.dateLostFound).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    images: initialData?.images || [],
    status: initialData?.status || 'open'
  });

  const [aiTags, setAiTags] = useState<string[]>([]);

  const { analyzeImage, isAnalyzing, error: aiError } = useImageAnalysis();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value as 'lost' | 'found' }));
  };

  const handleUploadSuccess = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), url]
    }));
  };

  const handleUploadRemove = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter(url => url !== urlToRemove) || []
    }));
  };

  const handleAnalyzeImage = async () => {
    if (!formData.images || formData.images.length === 0) return;
    
    const imageUrl = formData.images[0];
    const result = await analyzeImage(imageUrl);
    
    if (result) {
      setFormData(prev => ({
        ...prev,
        category: prev.category || result.category,
        color: prev.color || result.color,
        brand: prev.brand || result.brand,
      }));
      if (result.tags && result.tags.length > 0) {
        setAiTags(result.tags);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentImageUrl = formData.images && formData.images.length > 0 ? formData.images[0] : undefined;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={formData.type}
              label="Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="lost">Lost</MenuItem>
              <MenuItem value="found">Found</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" gutterBottom>
            Item Image
          </Typography>
          <ImageUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadRemove={handleUploadRemove}
            uploadedUrl={currentImageUrl}
          />
          {currentImageUrl && (
            <Box mt={2}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : undefined}
                fullWidth
              >
                {isAnalyzing ? 'Analyzing Image...' : 'Analyze Image ✨'}
              </Button>
              {aiError && (
                <Typography color="error" variant="caption" display="block" mt={1}>
                  {aiError}
                </Typography>
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                helperText="Auto-filled by AI if available"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="color"
                label="Color"
                value={formData.color}
                onChange={handleChange}
                helperText="Auto-filled by AI if available"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="brand"
                label="Brand"
                value={formData.brand}
                onChange={handleChange}
                helperText="Auto-filled by AI if available"
              />
            </Grid>
          </Grid>
        </Grid>

        {aiTags.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>AI Generated Tags:</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {aiTags.map((tag, idx) => (
                <Chip key={idx} label={tag} color="primary" variant="outlined" />
              ))}
            </Box>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="date"
            name="dateLostFound"
            label="Date Lost/Found"
            InputLabelProps={{ shrink: true }}
            value={formData.dateLostFound}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading || isAnalyzing}
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

