import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Skeleton, Grid } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getItemById } from '../../items/services/itemService';
import type { Item } from '../../items/services/itemService';
import { ClaimForm } from '../components/ClaimForm';
import {
  ArrowBack as ArrowBackIcon,
  VerifiedUserOutlined as VerifiedUserIcon
} from '@mui/icons-material';

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

        const itemData = await getItemById(itemId);

        setItem(itemData);
        setError(null);

      } catch (err) {
        console.error(err);
        setError("Failed to load item details");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  // Loading skeleton state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
        <Skeleton variant="text" width={150} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '18px', mb: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }} className="fade-in">
        <Typography color="error" variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {error || 'Item not found'}
        </Typography>
        <Link to="/items" style={{ textDecoration: 'none' }}>
          <Box display="inline-flex" alignItems="center" gap={1} sx={{ color: 'primary.main', fontWeight: 700 }}>
            <ArrowBackIcon fontSize="small" /> Back to Registry
          </Box>
        </Link>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* Header section */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Claim Item
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Complete the verification process to request ownership of this item.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: '10px',
            border: '1px solid rgba(79, 138, 91, 0.25)',
            bgcolor: 'rgba(79, 138, 91, 0.04)'
          }}
        >
          <VerifiedUserIcon sx={{ fontSize: 16, color: '#4F8A5B' }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#4F8A5B' }}>
            Secure Verification
          </Typography>
        </Box>
      </Box>

      {/* Claims form wizard */}
      <ClaimForm item={item} />
    </Container>
  );
};
