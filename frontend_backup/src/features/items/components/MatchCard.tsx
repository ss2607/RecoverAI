import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Grid } from '@mui/material';
import { Match } from '../services/matchService';
import { Link } from 'react-router-dom';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <Card sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Match Found!</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Confidence:</Typography>
            <Chip 
              label={`${match.confidenceScore}%`} 
              color={match.confidenceScore >= 80 ? "success" : match.confidenceScore >= 60 ? "warning" : "default"}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="error">Lost Item</Typography>
            <Typography 
              variant="body1" 
              component={Link} 
              to={`/items/${match.lostItem?._id}`}
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              {match.lostItem?.title || 'Unknown Item'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {match.lostItem?.location}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="success.main">Found Item</Typography>
            <Typography 
              variant="body1" 
              component={Link} 
              to={`/items/${match.foundItem?._id}`}
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 'bold' }}
            >
              {match.foundItem?.title || 'Unknown Item'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {match.foundItem?.location}
            </Typography>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Matched on: {match.matchedFields.join(', ')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
