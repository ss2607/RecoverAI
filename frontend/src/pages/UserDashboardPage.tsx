import { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  Avatar, 
  Chip, 
  Stack,
  Skeleton,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../features/auth/context/AuthContext';
import { socketService } from '../services/socketService';
import { getItems } from '../features/items/services/itemService';
import { getClaims } from '../features/claims/services/claimService';
import { getMatches } from '../features/items/services/matchService';
import type { Item } from '../features/items/services/itemService';
import type { Claim } from '../features/claims/services/claimService';
import type { Match } from '../features/items/services/matchService';
import { 
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  QrCodeScannerOutlined as QrCodeScannerOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  CalendarTodayOutlined as CalendarTodayOutlinedIcon,
  NotificationsActiveOutlined as NotificationsActiveIcon
} from '@mui/icons-material';

export const UserDashboardPage = () => {
  const { user } = useContext(AuthContext);

  // Live data states
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async (showLoadingSkeleton = true) => {
      try {
        if (showLoadingSkeleton) {
          setLoading(true);
        }
        setError(null);

        // Fetch concurrently
        const [itemsData, claimsResponse, matchesData] = await Promise.all([
          getItems().catch(() => [] as Item[]),
          getClaims().catch(() => ({ success: false, data: [] as Claim[] })),
          getMatches().catch(() => [] as Match[])
        ]);

        if (Array.isArray(itemsData)) {
          setItems(itemsData);
        }
        if (claimsResponse && claimsResponse.success && Array.isArray(claimsResponse.data)) {
          setClaims(claimsResponse.data);
        }
        if (Array.isArray(matchesData)) {
          setMatches(matchesData);
        }
      } catch (err) {
        console.error('Error fetching dashboard backend data', err);
        setError('Failed to load complete dashboard details.');
      } finally {
        if (showLoadingSkeleton) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData(true);

    const handleSocketUpdate = () => {
      // Refresh statistics and timeline in the background, avoiding flashing full-screen loaders
      fetchDashboardData(false);
    };

    socketService.on('stats_updated', handleSocketUpdate);
    socketService.on('new_match', handleSocketUpdate);

    return () => {
      socketService.off('stats_updated', handleSocketUpdate);
      socketService.off('new_match', handleSocketUpdate);
    };
  }, []);

  // Filter items reported by the user
  const userId = user?.id || '';
  const userItems = items.filter(item => {
    if (!userId) return false;
    const reporterId = typeof item.reportedBy === 'object' ? item.reportedBy._id : item.reportedBy;
    return reporterId === userId;
  });

  const lostCount = userItems.filter(i => i.type === 'lost').length;
  const foundCount = userItems.filter(i => i.type === 'found').length;
  
  // Claims made by user
  const userClaims = claims.filter(c => c.claimant?._id === userId);

  const pendingClaims = userClaims.filter(c => c.status === 'pending' || c.status === 'under_review').length;
  const approvedClaims = userClaims.filter(c => c.status === 'approved').length;
  const rejectedClaims = userClaims.filter(c => c.status === 'rejected').length;
  const needsInfoClaims = userClaims.filter(c => c.status === 'needs_info').length;

  // Item exchange stats
  const awaitingExchangeCount = userItems.filter(i => (i.status as string) === 'awaiting_exchange').length;
  const returnedCount = userItems.filter(i => (i.status as string) === 'returned').length;

  const stats = [
    { 
      label: 'Lost Reports', 
      value: String(lostCount), 
      desc: 'Active lost logs', 
      trend: lostCount > 0 ? `+${lostCount} total` : 'Stable', 
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#B24C4C' 
    },
    { 
      label: 'Found Reports', 
      value: String(foundCount), 
      desc: 'Community matches', 
      trend: foundCount > 0 ? `+${foundCount} total` : 'Stable', 
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#4F8A5B' 
    },
    { 
      label: 'Pending Claims', 
      value: String(pendingClaims), 
      desc: 'Claims under review', 
      trend: pendingClaims > 0 ? `+${pendingClaims} pending` : 'None', 
      icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#B88A5A' 
    },
    { 
      label: 'Approved Claims', 
      value: String(approvedClaims), 
      desc: 'Approved matches', 
      trend: approvedClaims > 0 ? `+${approvedClaims} approved` : 'None', 
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#4F8A5B' 
    },
    { 
      label: 'Rejected Claims', 
      value: String(rejectedClaims), 
      desc: 'Rejected requests', 
      trend: rejectedClaims > 0 ? `+${rejectedClaims} total` : 'None', 
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#B24C4C' 
    },
    { 
      label: 'Needs Info', 
      value: String(needsInfoClaims), 
      desc: 'Information requested', 
      trend: needsInfoClaims > 0 ? `${needsInfoClaims} action item` : 'None', 
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#D59B3A' 
    },
    { 
      label: 'Awaiting Exchange', 
      value: String(awaitingExchangeCount), 
      desc: 'Exchanges in progress', 
      trend: awaitingExchangeCount > 0 ? `${awaitingExchangeCount} pending` : 'None', 
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#2E6CB5' 
    },
    { 
      label: 'Returned Items', 
      value: String(returnedCount), 
      desc: 'Completed returns', 
      trend: returnedCount > 0 ? `${returnedCount} returned` : 'None', 
      icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />, 
      color: '#4F8A5B' 
    }
  ];

  const quickActions = [
    { 
      title: 'Report Lost Item', 
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />, 
      path: '/items/report', 
      desc: 'Log missing item to database' 
    },
    { 
      title: 'Report Found Item', 
      icon: <SearchOutlinedIcon sx={{ fontSize: 20 }} />, 
      path: '/items/report', 
      desc: 'Log an item you have recovered' 
    },
    { 
      title: 'Browse Registry', 
      icon: <ReportProblemOutlinedIcon sx={{ fontSize: 20 }} />, 
      path: '/items', 
      desc: 'Search reported items list' 
    },
    { 
      title: 'Scan QR Code', 
      icon: <QrCodeScannerOutlinedIcon sx={{ fontSize: 20 }} />, 
      path: '/qr/scan', 
      desc: 'Scan tag to contact owner' 
    },
  ];

  // Build dynamic activity logs
  const getActivityTimeline = () => {
    const events: { title: string; time: string; status: 'completed' | 'ai' | 'pending' }[] = [];
    
    // Sort user reports by date
    const sortedUserItems = [...userItems].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    sortedUserItems.forEach(item => {
      events.push({
        title: `Reported: ${item.title} (${item.type})`,
        time: new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: item.type === 'lost' ? 'pending' : 'completed'
      });
    });

    userClaims.forEach(claim => {
      events.push({
        title: `Claim Filed for ${claim.item?.title || 'Item'}`,
        time: new Date(claim.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: 'pending'
      });

      if (claim.status === 'under_review') {
        events.push({
          title: `Owner Reviewing claim for ${claim.item?.title || 'Item'}`,
          time: new Date(claim.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'pending'
        });
      } else if (claim.status === 'needs_info') {
        events.push({
          title: `Additional Info Requested for ${claim.item?.title || 'Item'}`,
          time: new Date(claim.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'pending'
        });
      } else if (claim.status === 'approved') {
        events.push({
          title: `Claim Approved & Awaiting Exchange for ${claim.item?.title || 'Item'}`,
          time: new Date(claim.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'completed'
        });
      } else if (claim.status === 'completed') {
        events.push({
          title: `Item Successfully Returned: ${claim.item?.title || 'Item'}`,
          time: new Date(claim.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'completed'
        });
      } else if (claim.status === 'rejected') {
        events.push({
          title: `Claim Rejected for ${claim.item?.title || 'Item'}`,
          time: new Date(claim.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'pending'
        });
      }
    });

    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5); // Max 5 items
  };

  const timelineEvents = getActivityTimeline();

  // SKELETON LOADERS
  if (loading) {
    return (
      <Container sx={{ py: 6 }} className="fade-in">
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '18px', mb: 5 }} />
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[1, 2, 3, 4].map(idx => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: '18px' }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }} className="fade-in">
      {/* Welcome Hero */}
      <Card 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 5, 
          borderRadius: '18px', 
          border: '1px solid #E7DDD1',
          background: 'linear-gradient(135deg, #FFFCF8 0%, #FDFBF7 100%)',
          boxShadow: '0 4px 20px rgba(123, 91, 61, 0.03)'
        }}
      >
        <Grid container alignItems="center" justifyContent="space-between" spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              Welcome back, {user?.name || 'User'} 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Manage your lost and found reports from one intelligent dashboard.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Secure Portal
              </Typography>
            </Box>
            <Chip 
              icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '14px !important', color: '#4F8A5B !important' }} />}
              label="AI System Active" 
              color="success" 
              variant="outlined"
              sx={{ 
                height: 32, 
                fontWeight: 700, 
                fontSize: '0.75rem',
                borderColor: 'rgba(79, 138, 91, 0.25)',
                bgcolor: 'rgba(79, 138, 91, 0.04)',
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: '18px',
                border: '1px solid #E7DDD1',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(123, 91, 61, 0.08)',
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(184, 138, 90, 0.08)', 
                      color: 'primary.main', 
                      width: 42, 
                      height: 42,
                      border: '1px solid rgba(184, 138, 90, 0.1)'
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Chip 
                    label={stat.trend} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      bgcolor: stat.trend.includes('+') ? 'rgba(79, 138, 91, 0.06)' : 'rgba(111, 111, 111, 0.06)',
                      color: stat.trend.includes('+') ? '#4F8A5B' : 'text.secondary',
                      border: 'none'
                    }} 
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, mb: 0.5, fontWeight: 800 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.01em' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Button
                component={Link}
                to={action.path}
                fullWidth
                variant="outlined"
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  gap: 2,
                  height: '100%',
                  borderRadius: '14px',
                  borderColor: '#E7DDD1',
                  bgcolor: '#FFFCF8',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(184, 138, 90, 0.04)',
                    boxShadow: '0 4px 14px rgba(184, 138, 90, 0.08)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(184, 138, 90, 0.08)', 
                    color: 'primary.main', 
                    width: 40, 
                    height: 40,
                    border: '1px solid rgba(184, 138, 90, 0.1)'
                  }}
                >
                  {action.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.25 }}>
                    {action.desc}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Split Area */}
      <Grid container spacing={4}>
        {/* Left Side: Recent Items & Recent Activity */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            
            {/* Recent Items Grid */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                      Recent Items
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active cases on your registry
                    </Typography>
                  </Box>
                  <Button 
                    component={Link} 
                    to="/items" 
                    variant="text" 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ fontWeight: 700 }}
                  >
                    View Registry
                  </Button>
                </Box>

                {userItems.length === 0 ? (
                  /* High Fidelity Minimalist Empty State */
                  <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
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
                      <Inventory2OutlinedIcon sx={{ fontSize: 32, color: '#B88A5A' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                      No active reports found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
                      You haven't logged any lost or found items yet. Get started by reporting an item to trigger AI matching.
                    </Typography>
                    <Button 
                      component={Link} 
                      to="/items/report" 
                      variant="contained" 
                      color="primary"
                      sx={{ px: 4 }}
                    >
                      Report Lost Item
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {userItems.slice(0, 6).map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: '14px',
                            border: '1px solid rgba(231, 221, 209, 0.6)',
                            bgcolor: '#FFFCF8',
                            transition: 'all 0.25s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.01)',
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 16px rgba(123, 91, 61, 0.05)'
                            }
                          }}
                        >
                          <Box sx={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                            <Box 
                              component="img"
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=300'}
                              alt={item.title}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Chip 
                              label={item.type.toUpperCase()}
                              color={item.type === 'lost' ? 'error' : 'success'}
                              size="small"
                              sx={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12, 
                                fontWeight: 800, 
                                fontSize: '0.65rem'
                              }}
                            />
                          </Box>
                          <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                              {item.category}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5, color: 'text.primary', minHeight: 40, lineHeight: 1.2 }}>
                              {item.title}
                            </Typography>
                            
                            <Stack spacing={0.75} mt="auto">
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.location}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                  {new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button 
                              component={Link} 
                              to={`/items/${item._id}`} 
                              variant="outlined" 
                              fullWidth 
                              size="small"
                              sx={{ py: 0.8, borderRadius: '10px' }}
                            >
                              Details
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Timeline */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.01em' }}>
                  Recent Activity
                </Typography>
                {timelineEvents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No recent administrative logs.
                  </Typography>
                ) : (
                  <Stack spacing={2} sx={{ position: 'relative', pl: 3.5, '&::before': { content: '""', position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', bgcolor: '#E7DDD1' } }}>
                    {timelineEvents.map((event, idx) => (
                      <Box key={idx} sx={{ position: 'relative' }}>
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            left: '-33px', 
                            top: '3px', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            bgcolor: event.status === 'ai' ? '#B88A5A' : (event.status === 'pending' ? '#D59B3A' : '#4F8A5B'),
                            border: '2.5px solid #FFFCF8',
                            boxShadow: '0 0 0 2px ' + (event.status === 'ai' ? 'rgba(184, 138, 90, 0.2)' : 'rgba(231, 221, 209, 0.4)')
                          }}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {event.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right Side: AI Insights & Notifications Panel */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            
            {/* AI Insights Panel */}
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
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: 4, 
                  bgcolor: 'primary.main' 
                }} 
              />
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Avatar sx={{ bgcolor: 'rgba(184, 138, 90, 0.08)', color: 'primary.main', width: 34, height: 34 }}>
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AI Insights
                  </Typography>
                </Box>

                {matches.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Analysis Pending
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {matches.slice(0, 3).map((match, idx) => (
                      <Box 
                        key={idx}
                        sx={{ 
                          p: 2, 
                          borderRadius: '12px', 
                          border: '1px solid #E7DDD1',
                          bgcolor: 'background.default',
                          transition: 'border-color 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}>
                            {match.lostItem?.title} matches {match.foundItem?.title}
                          </Typography>
                          <Chip 
                            label={`${match.confidenceScore ?? 90}% match`}
                            size="small"
                            sx={{ 
                              height: 18, 
                              fontSize: '0.65rem', 
                              fontWeight: 800, 
                              bgcolor: 'rgba(184, 138, 90, 0.1)', 
                              color: 'secondary.main',
                              border: 'none'
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Notifications Panel */}
            <Card elevation={0} sx={{ borderRadius: '18px', border: '1px solid #E7DDD1', bgcolor: '#FFFCF8' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: 'rgba(123, 91, 61, 0.08)', color: 'secondary.main', width: 34, height: 34 }}>
                      <NotificationsActiveIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Recent Alerts
                    </Typography>
                  </Box>
                  <Button 
                    component={Link} 
                    to="/notifications" 
                    variant="text" 
                    size="small"
                    sx={{ fontWeight: 700 }}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No alerts available at this time.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};
