import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Chip, CircularProgress, Divider } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getClaimById } from '../services/claimService';
import type { Claim } from '../services/claimService';

export const ClaimDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getClaimById(id);
        if (res.success) {
          setClaim(res.data);
        } else {
          setError(res.message || 'Failed to fetch claim');
        }
      } catch (err) {
        setError('Error fetching claim details');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error || !claim) return <Typography color="error" align="center" mt={4}>{error || 'Claim not found'}</Typography>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Claim Details
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Status</Typography>
            <Chip label={claim.status.replace('_', ' ').toUpperCase()} color={getStatusColor(claim.status) as any} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Verification Score: {claim.verificationScore !== null ? `${claim.verificationScore}%` : 'Pending'}</Typography>
          {claim.reviewNotes && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">Review Notes:</Typography>
              <Typography variant="body1">{claim.reviewNotes}</Typography>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Item Information</Typography>
          <Typography variant="body1" component={Link} to={`/items/${claim.item._id}`} sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}>
            {claim.item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {claim.item.description}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};
