import { useContext } from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Button, Divider, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../features/auth/context/AuthContext';
import { 
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  AutoAwesomeOutlined as AutoAwesomeOutlinedIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  QrCodeScannerOutlined as QrCodeScannerOutlinedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export const UserDashboardPage = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: 'Active Claims', value: '2', color: '#C6A27E', icon: <AutoAwesomeOutlinedIcon /> },
    { label: 'Reported Items', value: '5', color: '#8B6F47', icon: <Inventory2OutlinedIcon /> },
    { label: 'Resolved Cases', value: '3', color: '#4caf50', icon: <CheckCircleOutlinedIcon /> },
  ];

  const quickActions = [
    { title: 'Report Lost Item', icon: <ReportProblemOutlinedIcon />, path: '/items/report', bg: 'rgba(198, 162, 126, 0.1)', color: '#8B6F47' },
    { title: 'Scan QR Tag', icon: <QrCodeScannerOutlinedIcon />, path: '/qr/scan', bg: 'rgba(139, 111, 71, 0.1)', color: '#8B6F47' },
    { title: 'Settings', icon: <SettingsOutlinedIcon />, path: '/profile', bg: 'rgba(47, 47, 47, 0.05)', color: '#2F2F2F' },
  ];

  const notifications = [
    { title: 'New Match Found', desc: 'A matches alert is generated for your reported iPhone 15 Pro.', time: '2 hours ago', icon: <AutoAwesomeOutlinedIcon color="primary" />, read: false },
    { title: 'Claim Approved', desc: 'Your claim for "Leather Wallet" has been verified and approved.', time: '1 day ago', icon: <CheckCircleOutlinedIcon color="success" />, read: true },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="fade-in">
      {/* Header section */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Welcome back, {user?.name || 'User'}
          </Typography>
          <Typography color="text.secondary" variant="body1">
            Keep track of your active claims, reported items, and recovery progress.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Stats Row */}
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(198, 162, 126, 0.1)', 
                    color: stat.color, 
                    width: 56, 
                    height: 56 
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 0.5, fontWeight: 800 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={4}>
            {/* Quick Actions Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Quick Operations
                  </Typography>
                  <Grid container spacing={2}>
                    {quickActions.map((act, idx) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <Button
                          component={Link}
                          to={act.path}
                          fullWidth
                          variant="outlined"
                          sx={{
                            py: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                            borderRadius: 3,
                            borderColor: 'rgba(139, 111, 71, 0.15)',
                            bgcolor: 'rgba(255, 253, 248, 0.5)',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(198, 162, 126, 0.05)'
                            }
                          }}
                        >
                          <Avatar sx={{ bgcolor: act.bg, color: act.color, width: 44, height: 44 }}>
                            {act.icon}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {act.title}
                          </Typography>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity Card */}
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Recent Activity
                    </Typography>
                    <Button component={Link} to="/items" variant="text" size="small" endIcon={<ArrowForwardIcon />}>
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 4 }} />
                  
                  {/* Empty state redesigned */}
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 3, 
                        bgcolor: 'rgba(198, 162, 126, 0.08)',
                        color: 'primary.main' 
                      }}
                    >
                      <Inventory2OutlinedIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      No recent activity
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ maxWidth: 360, mx: 'auto', mb: 3 }}>
                      You haven't reported any lost or found items recently. Begin by logging a new item.
                    </Typography>
                    <Button 
                      component={Link} 
                      to="/items/report" 
                      variant="contained" 
                      color="primary"
                    >
                      Report an Item
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Notifications
                </Typography>
                <Button component={Link} to="/notifications" variant="text" size="small">
                  All
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {notifications.map((notif, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 3, 
                      border: '1px solid', 
                      borderColor: notif.read ? 'rgba(47, 47, 47, 0.06)' : 'rgba(198, 162, 126, 0.25)', 
                      bgcolor: notif.read ? 'transparent' : 'rgba(198, 162, 126, 0.04)',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: 'background.default', width: 36, height: 36 }}>
                        {notif.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}>
                          {notif.desc}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                          {notif.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
