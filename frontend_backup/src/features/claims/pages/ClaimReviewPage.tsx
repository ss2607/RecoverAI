import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, CircularProgress, Divider, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaimById, reviewClaim, Claim } from '../services/claimService';

export const ClaimReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getClaimById(id);
        if (res.success) {
          setClaim(res.data);
          setNotes(res.data.reviewNotes || '');
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

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await reviewClaim(id, status, notes);
      if (res.success) {
        setClaim(res.data);
        alert(`Claim ${status} successfully`);
      } else {
        setError(res.message || `Failed to ${status} claim`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error reviewing claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (error || !claim) return <Typography color="error" align="center" mt={4}>{error || 'Claim not found'}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Review Claim
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Verification Details</Typography>
              <Typography variant="subtitle1" color={claim.verificationScore !== null && claim.verificationScore >= 80 ? 'success.main' : 'warning.main'}>
                Score: {claim.verificationScore !== null ? `${claim.verificationScore}%` : 'N/A'} 
                {claim.verificationScore !== null && claim.verificationScore >= 80 ? ' (Recommended Approval)' : claim.verificationScore !== null ? ' (Recommended Review)' : ''}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Answers:</Typography>
              {claim.answers && claim.answers.length > 0 ? (
                claim.answers.map((ans, idx) => (
                  <Box key={idx} mb={2}>
                    <Typography variant="body2" color="text.secondary">Q: {ans.questionId}</Typography>
                    <Typography variant="body1">A: {ans.answer}</Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No answers submitted.</Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Item Information</Typography>
              <Typography variant="body1"><strong>Title:</strong> {claim.item.title}</Typography>
              <Typography variant="body1"><strong>Description:</strong> {claim.item.description}</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Review Action</Typography>
              <Typography variant="body2" mb={2}><strong>Claimant:</strong> {claim.claimant.name} ({claim.claimant.email})</Typography>
              <Typography variant="body2" mb={2}><strong>Status:</strong> {claim.status.toUpperCase()}</Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Notes"
                variant="outlined"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Box display="flex" gap={2}>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  disabled={submitting || claim.status === 'approved'}
                  onClick={() => handleReview('approved')}
                >
                  Approve
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  fullWidth 
                  disabled={submitting || claim.status === 'rejected'}
                  onClick={() => handleReview('rejected')}
                >
                  Reject
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
