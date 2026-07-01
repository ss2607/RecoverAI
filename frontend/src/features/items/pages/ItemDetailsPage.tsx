import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Button
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getItemById } from '../services/itemService';
import type { Item } from '../services/itemService';
import { 
  ArrowBack as ArrowBackIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
  SecurityOutlined as SecurityOutlinedIcon,
  ColorLensOutlined as ColorLensOutlinedIcon,
  BrandingWatermarkOutlined as BrandingWatermarkOutlinedIcon
} from '@mui/icons-material';

export const ItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (id) {
          const data = await getItemById(id);
          setItem(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" className="fade-in">
      <CircularProgress size={40} thickness={4} color="primary" />
    </Box>
  );
  if (error || !item) return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }} className="fade-in">
      <Typography color="error" variant="h5" gutterBottom>{error || 'Item not found'}</Typography>
      <Button component={Link} to="/items" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} variant="outlined">
        Back to Items
      </Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      <Button 
        component={Link} 
        to="/items" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 4, fontWeight: 700 }} 
        color="inherit"
      >
        Back to Directory
      </Button>
      
      <Grid container spacing={6}>
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0} 
            sx={{ 
              overflow: 'hidden', 
              border: '1px solid rgba(139, 111, 71, 0.08)', 
              borderRadius: 5,
              backgroundColor: '#FFFDF8',
              p: 2
            }}
          >
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 4
              }}
              src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'}
              alt={item.title}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Chip
              label={item.type.toUpperCase()}
              color={item.type === 'lost' ? 'error' : 'success'}
              size="medium"
              sx={{ fontWeight: 800, letterSpacing: '0.05em' }}
            />
            <Chip 
              label={item.status.toUpperCase()} 
              variant="outlined" 
              sx={{ 
                fontWeight: 700, 
                borderColor: 'rgba(139, 111, 71, 0.2)',
                color: 'text.secondary'
              }} 
            />
          </Box>
          
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 850, mb: 2, lineHeight: 1.2 }}>
            {item.title}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.05rem', lineHeight: 1.7, mb: 4 }}>
            {item.description}
          </Typography>
          
          {/* Metadata Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              bgcolor: '#FFFDF8', 
              borderRadius: 4, 
              mb: 4, 
              border: '1px solid rgba(139, 111, 71, 0.08)' 
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 750, mb: 3 }}>
              Item Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                <LocationOnOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Location</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.location}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                <CalendarTodayOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date Lost/Found</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {new Date(item.dateLostFound).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                <CategoryOutlinedIcon sx={{ color: 'secondary.main' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Category</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.category}</Typography>
                </Box>
              </Grid>
              {item.color && (
                <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                  <ColorLensOutlinedIcon sx={{ color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Color</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.color}</Typography>
                  </Box>
                </Grid>
              )}
              {item.brand && (
                <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                  <BrandingWatermarkOutlinedIcon sx={{ color: 'secondary.main' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Brand</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.brand}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          <Button 
            component={Link} 
            to={`/claims/create/${item._id}`} 
            variant="contained" 
            color="primary" 
            size="large" 
            fullWidth
            sx={{ py: 2, fontSize: '1.05rem', fontWeight: 700, mb: 2 }}
          >
            Claim this Item
          </Button>

          {/* Secure matching disclaimer */}
          <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: 3, border: '1px solid rgba(198, 162, 126, 0.15)', bgcolor: 'rgba(198, 162, 126, 0.05)' }}>
            <SecurityOutlinedIcon color="primary" sx={{ fontSize: 20, mt: 0.2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              <strong>Ownership Verification</strong>: RecoverAI matches claimant credentials using dynamic screening. You will need to answer owner-defined verification questions to proceed with recovery.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
