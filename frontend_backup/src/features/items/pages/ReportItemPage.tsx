import React, { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { ItemForm } from '../components/ItemForm';
import { createItem, ItemPayload } from '../services/itemService';
import { useNavigate } from 'react-router-dom';

export const ReportItemPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: ItemPayload) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await createItem(data);
      if (response.success) {
        navigate('/items');
      } else {
        setError(response.message || 'Failed to create item');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating the item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Report a Lost or Found Item
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please provide as many details as possible to help identify the item.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <ItemForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Box>
    </Container>
  );
};
