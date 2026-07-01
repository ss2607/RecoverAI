import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { Item } from '../../items/services/itemService';
import { createClaim } from '../services/claimService';
import { VerificationQuestions } from './VerificationQuestions';
import { Answer, submitVerification } from '../services/claimService';
import { useNavigate } from 'react-router-dom';

interface ClaimFormProps {
  item: Item;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ item }) => {
  const [claimId, setClaimId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateClaim = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await createClaim(item._id);
      if (res.success && res.data) {
        setClaimId(res.data._id);
        setStep(2);
      } else {
        setError(res.message || 'Failed to initiate claim');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating claim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswers = async (answers: Answer[]) => {
    if (!claimId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await submitVerification(claimId, answers);
      if (res.success) {
        navigate(`/claims/${claimId}`);
      } else {
        setError(res.message || 'Failed to submit verification');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Item Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box 
              component="img"
              src={item.images?.[0] || 'https://via.placeholder.com/150'}
              sx={{ width: '100%', borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body1" paragraph>{item.description}</Typography>
            <Typography variant="body2" color="text.secondary">Location: {item.location}</Typography>
            <Typography variant="body2" color="text.secondary">Date: {new Date(item.dateLostFound).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {step === 1 ? (
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleCreateClaim}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Initiating Claim...' : 'Start Claim Process'}
        </Button>
      ) : (
        <VerificationQuestions 
          itemId={item._id} 
          onSubmitAnswers={handleSubmitAnswers} 
          isLoading={isLoading} 
        />
      )}
    </Box>
  );
};
