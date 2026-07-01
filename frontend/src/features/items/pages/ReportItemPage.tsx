import React, { useState } from 'react';
import { Container, Typography, Box, Alert, Paper } from '@mui/material';
import { ItemForm } from '../components/ItemForm';
import { createItem } from '../services/itemService';
import type { ItemPayload } from '../services/itemService';
import { useNavigate } from 'react-router-dom';

export const ReportItemPage: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData: ItemPayload) => {
    try {
      setIsLoading(true);
      setError('');
      const newItem = await createItem(formData);
      navigate(`/items/${newItem._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while reporting the item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box mb={4} textAlign="center">
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Report an Item
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Provide as many details as possible to help our AI match the item accurately.
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
        
        <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <ItemForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Box>
      </Paper>
    </Container>
  );
};
