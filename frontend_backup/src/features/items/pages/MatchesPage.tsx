import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { getMatches, Match } from '../services/matchService';
import { MatchCard } from '../components/MatchCard';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const response = await getMatches();
        if (response.success) {
          setMatches(response.data);
        } else {
          setError(response.message || 'Failed to fetch matches');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching matches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1">
          Potential Matches
        </Typography>
      </Box>

      {matches.length === 0 ? (
        <Box textAlign="center" sx={{ mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No matches found yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item key={match._id} xs={12} md={6}>
              <MatchCard match={match} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
