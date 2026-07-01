import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Paper } from '@mui/material';
import { getMatches } from '../services/matchService';
import type { Match } from '../services/matchService';
import { MatchCard } from '../components/MatchCard';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

export const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        setMatches(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={40} thickness={4} />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', p: 2, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
          <AutoAwesomeIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          AI Matches
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Our system has automatically detected potential matches between reported lost and found items. Review them below.
        </Typography>
      </Box>

      {error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : matches.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No matches found yet.</Typography>
          <Typography color="text.secondary">We'll notify you as soon as our AI finds a potential match for your items.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {matches.map((match) => (
            <Grid item key={match._id} xs={12} md={6}>
              <Box sx={{ '& .MuiCard-root': { height: '100%' } }}>
                <MatchCard match={match} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
