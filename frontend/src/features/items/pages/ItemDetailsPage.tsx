import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  Divider,
  Avatar,
  Stack,
  Skeleton,
  LinearProgress,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getItemById, getItems, getItemMatches } from '../services/itemService';
import type { Item } from '../services/itemService';
import { AIRecommendationCard } from '../components/AIRecommendationCard';
import { 
  ArrowBack as ArrowBackIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  SecurityOutlined as SecurityOutlinedIcon,
  ColorLensOutlined as ColorLensOutlinedIcon,
  BrandingWatermarkOutlined as BrandingWatermarkOutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeIcon,
  QrCodeOutlined as QrCodeIcon,
  ShareOutlined as ShareIcon,
  WarningAmberOutlined as WarningIcon,
  BookmarkBorderOutlined as BookmarkIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  MapOutlined as MapIcon
} from '@mui/icons-material';

// ----------------------------------------------------------------------
// Reusable Similar Item Card (can be moved or exported later)
// ----------------------------------------------------------------------
interface SimilarItemCardProps {
  id: string;
  title: string;
  category: string;
  confidence: string;
  location: string;
  date: string;
  status: string;
  image: string;
}

export const SimilarItemCard = ({
  id,
  title,
  category,
  confidence,
  location,
  date,
  status,
  image
}: SimilarItemCardProps) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        minWidth: 280,
        maxWidth: 280,
        borderRadius: '14px',
        border: '1px solid rgba(231, 221, 209, 0.6)',
        bgcolor: '#FFFCF8',
        transition: 'all 0.25s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(123, 91, 61, 0.06)'
        }
      }}
    >
      <Box sx={{ height: 140, overflow: 'hidden', position: 'relative' }}>
        <Box 
          component="img"
          src={image}
          alt={title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Chip 
          label={status.toUpperCase()}
          color={status === 'lost' ? 'error' : 'success'}
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            fontWeight: 800, 
            fontSize: '0.65rem',
            height: '20px'
          }}
        />
        <Chip 
          label={`${confidence} Match`}
          size="small"
          sx={{ 
            position: 'absolute', 
            bottom: 12, 
            left: 12, 
            fontWeight: 800, 
            fontSize: '0.65rem',
            bgcolor: '#7B5B3D',
            color: '#FFFCF8',
            height: '20px'
          }}
        />
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
          {category}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5, color: 'text.primary', minHeight: 36, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </Typography>
        
        <Stack spacing={0.5} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOnOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {date}
            </Typography>
          </Box>
        </Stack>

        <Button 
          component={Link} 
          to={`/items/${id}`} 
          variant="outlined" 
          fullWidth 
          size="small"
          sx={{ py: 0.8, borderRadius: '10px', fontWeight: 700 }}
        >
          Open Details
        </Button>
      </Box>
    </Card>
  );
};

export const ItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchMatches = async () => {
    if (!id) return;
    try {
      setLoadingMatches(true);
      const matchesData = await getItemMatches(id);
      if (Array.isArray(matchesData)) {
        setAiMatches(matchesData);
      }
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        if (id) {
          const data = await getItemById(id);
          setItem(data);
          
          // Fetch similar category items from registry
          const allItems = await getItems();
          if (Array.isArray(allItems)) {
            const filtered = allItems.filter(
              (i: Item) => i._id !== id && i.category === data.category
            );
            setSimilarItems(filtered.slice(0, 3));
          }

          // Fetch matching suggestions
          fetchMatches();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Image Helper
  const getImagesList = () => {
    if (item && Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    return ['https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'];
  };

  const images = getImagesList();

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
        <Skeleton variant="text" width={150} height={30} sx={{ mb: 4 }} />
        <Grid container spacing={5}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '18px', mb: 3 }} />
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="90%" height={24} sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '18px', mb: 3 }} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '18px', mb: 3 }} />
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // ERROR OR EMPTY STATE
  if (error || !item) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }} className="fade-in">
        <Box 
          sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: 'rgba(178, 76, 76, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto',
            mb: 3,
            border: '1px solid rgba(178, 76, 76, 0.15)'
          }}
        >
          <WarningIcon sx={{ fontSize: 36, color: '#B24C4C' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {error || 'Item details not found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 4 }}>
          This record might have been removed, or the link is invalid. Please double-check your registry index.
        </Typography>
        <Button component={Link} to="/items" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Directory
        </Button>
      </Container>
    );
  }

  const categoryStr = item.category || 'General';
  const typeStr = item.type || 'lost';
  const statusStr = item.status || 'open';
  const dateStr = item.dateLostFound 
    ? new Date(item.dateLostFound).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) 
    : 'Unknown Date';
  const locationStr = item.location || 'Unknown Location';
  const brandStr = item.brand || 'Unspecified';
  const colorStr = item.color || 'Unspecified';

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* Back link */}
      <Button 
        component={Link} 
        to="/items" 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 4, fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'text.primary' } }} 
      >
        Back to Directory
      </Button>

      {/* SECTION 1: Premium Hero */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Chip
            label={typeStr.toUpperCase()}
            color={typeStr === 'lost' ? 'error' : 'success'}
            size="small"
            sx={{ fontWeight: 800, letterSpacing: '0.05em', height: 24, fontSize: '0.65rem' }}
          />
          <Chip 
            label={statusStr.toUpperCase()} 
            variant="outlined" 
            size="small"
            sx={{ 
              fontWeight: 700, 
              borderColor: 'rgba(123, 91, 61, 0.25)',
              color: 'text.secondary',
              height: 24,
              fontSize: '0.65rem'
            }} 
          />
          <Chip 
            icon={<AutoAwesomeIcon sx={{ fontSize: '12px !important', color: '#4F8A5B !important' }} />}
            label={item.aiTags && item.aiTags.length > 0 ? "AI Tags Active" : "Analysis Pending"} 
            size="small"
            sx={{ 
              height: 24,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: 'rgba(79, 138, 91, 0.08)',
              color: '#4F8A5B',
              border: 'none'
            }}
          />
        </Stack>
        <Typography variant="h2" sx={{ fontWeight: 850, mb: 1, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {item.title || 'Untitled Report'}
        </Typography>
        <Stack direction="row" spacing={3} divider={<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#E7DDD1', alignSelf: 'center' }} />} flexWrap="wrap" gap={1}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Report ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{id?.substring(0, 8) || 'N/A'}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Category: <strong>{categoryStr}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Reported: <strong>{new Date(item.dateLostFound || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </Typography>
        </Stack>
      </Box>

      {/* Main Grid split */}
      <Grid container spacing={5}>
        
        {/* Left Side: Images & Detailed Content */}
        <Grid item xs={12} md={7.5}>
          <Stack spacing={4}>
            
            {/* SECTION 2: Image Gallery */}
            <Card elevation={0} sx={{ p: 2, borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9.5}>
                  <CardMedia
                    component="img"
                    height="420"
                    image={images[activeImageIndex]}
                    alt={item.title}
                    sx={{ 
                      borderRadius: '12px', 
                      objectFit: 'cover', 
                      width: '100%',
                      border: '1px solid rgba(231, 221, 209, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2.5}>
                  <Stack 
                    direction={{ xs: 'row', sm: 'column' }} 
                    spacing={1.5} 
                    sx={{ 
                      height: '100%', 
                      overflowX: 'auto', 
                      overflowY: 'auto',
                      maxHeight: { xs: 'auto', sm: 420 } 
                    }}
                  >
                    {images.map((imgUrl, index) => (
                      <Box
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        sx={{
                          width: { xs: 60, sm: '100%' },
                          height: 60,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: activeImageIndex === index ? 'primary.main' : 'rgba(231, 221, 209, 0.6)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Box component="img" src={imgUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            {/* SECTION 3: Item Information */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.01em' }}>
                  Item Description & Parameters
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                  {item.description || 'No detailed description provided.'}
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                    <LocationOnOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Reported Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{locationStr}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                    <CalendarTodayOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Date Logged</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{dateStr}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                    <BrandingWatermarkOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Brand / Manufacturer</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{brandStr}</Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} display="flex" alignItems="center" gap={2}>
                    <ColorLensOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Color</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{colorStr}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {(item as any).notes && (
                  <Box sx={{ mt: 4, p: 2.5, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid #E7DDD1' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                      Owner Notes:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {(item as any).notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* SECTION 4: AI Analysis Card */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: '18px', 
                border: '1px solid #E7DDD1', 
                bgcolor: '#FFFCF8',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'primary.main' }} />
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={3.5}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 34, height: 34 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AI Analysis Results
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          AI Classification
                        </Typography>
                        <Chip label={categoryStr} size="small" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Detected Color / Brand
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip label={colorStr} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                          <Chip label={brandStr} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.75}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Visual Match Confidence
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                          92% Similarity
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={92} 
                        color="success"
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#E7DDD1' }}
                      />
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip label="#Electronic" size="small" sx={{ fontSize: '0.65rem' }} />
                      <Chip label={brandStr} size="small" sx={{ fontSize: '0.65rem' }} />
                      <Chip label={categoryStr} size="small" sx={{ fontSize: '0.65rem' }} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 5: Recovery Timeline & Activity Log */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.01em' }}>
                  Recovery Progression Track
                </Typography>
                <Stack 
                  spacing={3} 
                  sx={{ 
                    position: 'relative', 
                    pl: 3.5, 
                    '&::before': { 
                      content: '""', 
                      position: 'absolute', 
                      left: '11px', 
                      top: '8px', 
                      bottom: '8px', 
                      width: '2px', 
                      bgcolor: '#E7DDD1' 
                    } 
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: '-33px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', bgcolor: '#4F8A5B', border: '2.5px solid #FFFCF8' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>Report Created & Logged</Typography>
                    <Typography variant="caption" color="text.secondary">Item successfully entered in our registry database.</Typography>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: '-33px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', bgcolor: '#B88A5A', border: '2.5px solid #FFFCF8' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>AI Analysis Completed</Typography>
                    <Typography variant="caption" color="text.secondary">Computer vision category model detected category: {categoryStr}.</Typography>
                  </Box>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: '-33px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', bgcolor: '#D59B3A', border: '2.5px solid #FFFCF8' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>Verification Pending</Typography>
                    <Typography variant="caption" color="text.secondary">Awaiting owner response for credential screening.</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* SECTION 6: Location Card */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                  <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 34, height: 34 }}>
                    <MapIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Reported Area Map
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  This item was reported near: <strong>{locationStr}</strong>.
                </Typography>
                {/* Visual Map Placeholder */}
                <Box 
                  sx={{ 
                    height: 200, 
                    borderRadius: '12px', 
                    bgcolor: 'background.default', 
                    border: '1px solid #E7DDD1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <MapIcon sx={{ fontSize: 32, color: 'primary.main', opacity: 0.6 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Map preview not loaded (Development Mock)
                  </Typography>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right Side: Actions Panel & Verification */}
        <Grid item xs={12} md={4.5}>
          <Stack 
            spacing={4} 
            sx={{ 
              position: { md: 'sticky' }, 
              top: { md: 100 } 
            }}
          >
            
            {/* SECTION 8: Action Panel */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: '18px', 
                border: '1px solid #E7DDD1', 
                bgcolor: '#FFFCF8',
                boxShadow: '0 8px 30px rgba(123, 91, 61, 0.04)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                  Recovery Options
                </Typography>
                
                <Stack spacing={2}>
                  <Button 
                    component={Link} 
                    to={`/claims/create/${item._id}`} 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    Claim this Item
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="primary"
                    fullWidth
                    size="large"
                    startIcon={<ChatIcon />}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    Contact Finder
                  </Button>
                  
                  <Button 
                    component={Link}
                    to={`/qr/generate/${item._id}`}
                    variant="text" 
                    fullWidth
                    startIcon={<QrCodeIcon />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Generate QR Tag
                  </Button>

                  <Button 
                    variant="text" 
                    fullWidth
                    startIcon={<ShareIcon />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Share Item Report
                  </Button>

                  <Button 
                    variant="text" 
                    fullWidth
                    startIcon={<BookmarkIcon />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Save Item to Watchlist
                  </Button>
                  
                  <Divider sx={{ my: 1 }} />

                  <Button 
                    variant="text" 
                    fullWidth
                    startIcon={<WarningIcon />}
                    sx={{ justifyContent: 'flex-start', color: '#B24C4C', fontWeight: 600, '&:hover': { bgcolor: 'rgba(178, 76, 76, 0.04)' } }}
                  >
                    Report Incorrect Info
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* SECTION 7: Owner Verification */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                  <Avatar sx={{ bgcolor: 'rgba(79, 138, 91, 0.08)', color: '#4F8A5B', width: 34, height: 34 }}>
                    <SecurityOutlinedIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Verification Details
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(184, 138, 90, 0.04)', border: '1px solid rgba(184, 138, 90, 0.15)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Claims screening active
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5, fontWeight: 500 }}>
                    To claim ownership of this MacBook Pro, you must verify the serial numbers or list identifying modifications during checkout.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>

      {/* SECTION 8.5: AI Match Suggestions */}
      <Box sx={{ mt: 8, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          AI Match Suggestions <Chip icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#4F8A5B !important' }} />} label="Gemini Engine" color="success" size="small" variant="outlined" sx={{ fontWeight: 700, borderColor: 'rgba(79, 138, 91, 0.25)', bgcolor: 'rgba(79, 138, 91, 0.04)' }} />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
          Intelligent matches calculated automatically by analyzing visual tags, brand, color, and categories.
        </Typography>

        {loadingMatches ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map(idx => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))}
          </Grid>
        ) : aiMatches.length === 0 ? (
          /* Premium Empty State */
          <Box 
            sx={{ 
              py: 8, 
              px: 2, 
              textAlign: 'center', 
              borderRadius: '20px', 
              border: '1px solid #E7DDD1',
              bgcolor: '#FFFCF8' 
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'rgba(184, 138, 90, 0.08)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mx: 'auto',
                mb: 3,
                border: '1px solid rgba(184, 138, 90, 0.12)'
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 32, color: '#B88A5A' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              No Similar Reports Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
              We'll continue checking for new reports automatically. You can also trigger an immediate index refresh.
            </Typography>
            <Button 
              onClick={fetchMatches} 
              variant="outlined" 
              color="primary"
              sx={{ px: 4, fontWeight: 700, borderRadius: '12px' }}
            >
              Refresh Matches
            </Button>
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* Match Insights Panel */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potential Matches</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 850, mt: 1, color: 'text.primary' }}>{aiMatches.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Confidence</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 850, mt: 1, color: '#4F8A5B' }}>
                      {Math.max(...aiMatches.map(m => m.similarityScore))}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Match</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 850, mt: 1, color: '#D59B3A' }}>
                      {Math.round(aiMatches.reduce((acc, curr) => acc + curr.similarityScore, 0) / aiMatches.length)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ borderRadius: '14px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Attributes</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Category, Color, Brand
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recommendations Grid */}
            <Grid container spacing={3}>
              {aiMatches.map((matchData, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <AIRecommendationCard 
                    item={matchData.item}
                    similarityScore={matchData.similarityScore}
                    matchedFields={matchData.matchedFields}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}
      </Box>

      {/* SECTION 9: Similar Items */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3.5, letterSpacing: '-0.02em' }}>
          Similar Reported Items
        </Typography>
        {similarItems.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No similar items found in registry.
          </Typography>
        ) : (
          <Stack 
            direction="row" 
            spacing={3} 
            sx={{ 
              overflowX: 'auto', 
              pb: 2,
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { height: '6px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#D8C3A5', borderRadius: '4px' }
            }}
          >
            {similarItems.map((similarItem) => (
              <SimilarItemCard 
                key={similarItem._id}
                id={similarItem._id}
                title={similarItem.title}
                category={similarItem.category}
                confidence="90%"
                location={similarItem.location}
                date={new Date(similarItem.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                status={similarItem.type}
                image={similarItem.images?.[0] || 'https://images.unsplash.com/photo-1584824486509-112e4181f1b6?auto=format&fit=crop&q=80'}
              />
            ))}
          </Stack>
        )}
      </Box>

    </Container>
  );
};
