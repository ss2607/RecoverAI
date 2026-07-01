import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getItemById, Item } from '../services/itemService';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await getItemById(id);
        if (response.success) {
          setItem(response.data);
        } else {
          setError(response.message || 'Failed to fetch item details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching item details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
          {error || 'Item not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={3} sx={{ overflow: 'hidden' }}>
          <Box 
            component="img"
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
            }}
            src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/800x400?text=No+Image+Available'}
            alt={item.title}
          />
          
          <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h3" component="h1">
                {item.title}
              </Typography>
              <Chip 
                label={item.type.toUpperCase()} 
                color={item.type === 'lost' ? 'error' : 'success'} 
                size="medium"
                sx={{ fontSize: '1rem', px: 1 }}
              />
            </Box>
            
            <Box display="flex" gap={1} mb={3}>
              <Chip label={`Status: ${item.status}`} variant="outlined" />
              <Chip label={`Category: ${item.category}`} variant="outlined" />
            </Box>

            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {item.location}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Date {item.type === 'lost' ? 'Lost' : 'Found'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(item.dateLostFound).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Brand
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {item.brand || 'Not specified'}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Color
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {item.color || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>

            {item.aiTags && item.aiTags.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  AI Tags
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {item.aiTags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
