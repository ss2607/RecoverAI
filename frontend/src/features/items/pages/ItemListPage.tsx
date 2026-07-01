import { useEffect, useState } from 'react';
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
  Button,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { getItems } from '../services/itemService';
import type { Item } from '../services/itemService';
import { Link } from 'react-router-dom';
import { 
  Search as SearchIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export const ItemListPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getItems();
        setItems(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabValue === 0 ? true : (tabValue === 1 ? item.type === 'lost' : item.type === 'found');
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" className="fade-in">
      <CircularProgress size={40} thickness={4} color="primary" />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 850, mb: 1 }}>
            Browse Registry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search through our intelligent database of reported lost and found items.
          </Typography>
        </Box>
        <Button 
          component={Link} 
          to="/items/report" 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          size="large"
          sx={{ fontWeight: 700 }}
        >
          Report an Item
        </Button>
      </Box>

      {/* Filter and Search Panel */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 5, 
          display: 'flex', 
          gap: 3, 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderRadius: 3,
          border: '1px solid rgba(139, 111, 71, 0.08)',
          backgroundColor: '#FFFDF8'
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search by title, description, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: '450px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)} 
          sx={{ 
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: '3px',
              borderRadius: '3px'
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'secondary.main',
              }
            }
          }}
        >
          <Tab label="All Items" />
          <Tab label="Lost" />
          <Tab label="Found" />
        </Tabs>
      </Paper>

      {/* Items Grid */}
      {error ? (
        <Typography color="error" align="center" variant="h6" sx={{ my: 8 }}>{error}</Typography>
      ) : filteredItems.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            borderRadius: 4, 
            border: '1px solid rgba(139, 111, 71, 0.08)',
            backgroundColor: '#FFFDF8',
            maxWidth: '600px',
            mx: 'auto',
            my: 6
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>No items found</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
            Try adjusting your search query or filters to find what you are looking for.
          </Typography>
          <Button component={Link} to="/items/report" variant="outlined" color="primary">
            Report a New Item
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {filteredItems.map((item) => (
            <Grid item key={item._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'}
                    alt={item.title}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Chip
                    label={item.type.toUpperCase()}
                    color={item.type === 'lost' ? 'error' : 'success'}
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16, 
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      px: 1,
                      py: 0.5
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                    {item.category || 'General'}
                  </Typography>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 750, mb: 1.5, lineHeight: 1.2 }}>
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3, 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}
                  >
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{item.location}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Button 
                    component={Link} 
                    to={`/items/${item._id}`} 
                    variant="outlined" 
                    color="primary"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{ py: 1.2, fontWeight: 700 }}
                  >
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
