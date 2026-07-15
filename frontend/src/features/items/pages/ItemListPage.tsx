import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Skeleton
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
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching items');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter(item => {
    if (!item) return false;
    const title = item.title || '';
    const description = item.description || '';
    const location = item.location || '';
    const category = item.category || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabValue === 0 ? true : (tabValue === 1 ? item.type === 'lost' : item.type === 'found');
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* Page Header Skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 3 }}>
        <Box>
          <Skeleton variant="text" width={220} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={380} height={20} />
        </Box>
        <Skeleton variant="rectangular" width={160} height={48} sx={{ borderRadius: '14px' }} />
      </Box>

      {/* Filter and Search Panel Skeleton */}
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
        <Skeleton variant="rectangular" width={300} height={50} sx={{ borderRadius: '14px' }} />
        <Skeleton variant="rectangular" width={250} height={40} sx={{ borderRadius: '8px' }} />
      </Paper>

      {/* Grid of Card Skeletons */}
      <Grid container spacing={4}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item key={i} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Skeleton variant="rectangular" height={240} />
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="95%" height={20} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} />
                <Box display="flex" flexDirection="column" gap={1}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
              </CardContent>
              <Box sx={{ p: 3, pt: 0 }}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '14px' }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
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
          {filteredItems.map((item) => {
            if (!item) return null;
            const itemId = item._id || '';
            const itemImages = Array.isArray(item.images) ? item.images : [];
            const itemType = item.type || 'lost';
            const itemCategory = item.category || 'General';
            const itemTitle = item.title || 'Untitled';
            const itemDescription = item.description || '';
            const itemLocation = item.location || 'Unknown';
            const itemDate = item.dateLostFound 
              ? new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'Unknown Date';

            return (
              <Grid item key={itemId} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={itemImages.length > 0 ? itemImages[0] : 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'}
                      alt={itemTitle}
                      sx={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <Chip
                      label={itemType.toUpperCase()}
                      color={itemType === 'lost' ? 'error' : 'success'}
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
                      {itemCategory}
                    </Typography>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 750, mb: 1.5, lineHeight: 1.2 }}>
                      {itemTitle}
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
                      {itemDescription}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{itemLocation}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {itemDate}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button 
                      component={Link} 
                      to={`/items/${itemId}`} 
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
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
