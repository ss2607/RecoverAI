import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import { getItems, Item } from '../services/itemService';
import { Link } from 'react-router-dom';

export const ItemListPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await getItems();
        if (response.success) {
          setItems(response.data);
        } else {
          setError(response.message || 'Failed to fetch items');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
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
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Lost & Found Items
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/items/report">
          Report Item
        </Button>
      </Box>

      {items.length === 0 ? (
        <Box textAlign="center" sx={{ mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No items found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {items.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {item.title}
                    </Typography>
                    <Chip 
                      label={item.type.toUpperCase()} 
                      color={item.type === 'lost' ? 'error' : 'success'} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="caption" display="block">
                      <strong>Location:</strong> {item.location}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Date:</strong> {new Date(item.dateLostFound).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <Box p={2} pt={0}>
                  <Button size="small" component={Link} to={`/items/${item._id}`} fullWidth variant="outlined">
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
