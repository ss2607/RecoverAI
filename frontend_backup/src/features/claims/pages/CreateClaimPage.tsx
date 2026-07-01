import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getItemById, Item } from '../../items/services/itemService';
import { ClaimForm } from '../components/ClaimForm';

export const CreateClaimPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;
      try {
        setLoading(true);
        const res = await getItemById(itemId);
        if (res.success) {
          setItem(res.data);
        } else {
          setError('Failed to load item details');
        }
      } catch (err) {
        setError('Error loading item details');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error || !item) return <Typography color="error" align="center" mt={4}>{error || 'Item not found'}</Typography>;

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit a Claim
        </Typography>
        <ClaimForm item={item} />
      </Box>
    </Container>
  );
};
