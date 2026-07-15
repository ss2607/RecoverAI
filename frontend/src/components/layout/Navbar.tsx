import { useContext, useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Avatar, 
  Badge, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../features/auth/context/AuthContext';
import { 
  NotificationsActiveOutlined as NotificationsActiveOutlinedIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { notificationService } from '../../features/notifications/services/notificationService';
import { socketService } from '../../services/socketService';

export const Navbar = () => {
  const { isAuthenticated, user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchCount = async () => {
        try {
          const list = await notificationService.getNotifications(token);
          if (Array.isArray(list)) {
            const count = list.filter((n: any) => !n.read).length;
            setUnreadCount(count);
          }
        } catch (e) {
          console.error('Error fetching unread count', e);
        }
      };
      
      fetchCount();

      const handleRealtimeUpdate = () => {
        fetchCount();
      };

      socketService.on('notification_created', handleRealtimeUpdate);
      socketService.on('stats_updated', handleRealtimeUpdate);

      return () => {
        socketService.off('notification_created', handleRealtimeUpdate);
        socketService.off('stats_updated', handleRealtimeUpdate);
      };
    }
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const linkStyle = (path: string) => ({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: isActive(path) ? 'secondary.main' : 'text.secondary',
    px: 2,
    py: 1,
    borderRadius: '10px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      color: 'text.primary',
      backgroundColor: 'rgba(184, 138, 90, 0.06)'
    }
  });

  const navLinks = [
    { label: 'Browse registry', path: '/items' },
    ...(isAuthenticated ? [
      { label: 'Dashboard', path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard' },
      { label: 'AI Matches', path: '/matches' }
    ] : [])
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 252, 248, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(231, 221, 209, 0.6)',
        boxShadow: '0 8px 30px rgba(123, 91, 61, 0.04)',
        zIndex: 1200,
        backgroundImage: 'none',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            justifyContent: 'space-between', 
            py: 1,
          }}
        >
          {/* Logo / Brand */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box 
              component={Link}
              to="/"
              sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '10px', 
                bgcolor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'primary.contrastText',
                boxShadow: '0 4px 12px rgba(184, 138, 90, 0.25)',
                textDecoration: 'none'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif' }}>R</Typography>
            </Box>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                fontSize: '1.25rem',
                color: 'text.primary',
                textDecoration: 'none',
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: '-0.5px'
              }}
            >
              RecoverAI
            </Typography>
          </Box>
          
          {/* Desktop Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button key={link.path} component={Link} to={link.path} sx={linkStyle(link.path)}>
                  {link.label}
                </Button>
              ))}
              
              {isAuthenticated ? (
                <>
                  {/* Notifications Link */}
                  <IconButton 
                    component={Link} 
                    to="/notifications" 
                    sx={{ 
                      color: isActive('/notifications') ? 'secondary.main' : 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(184, 138, 90, 0.06)' },
                      ml: 1,
                      p: 1.25,
                      borderRadius: '10px'
                    }}
                  >
                    <Badge color="error" badgeContent={unreadCount}>
                      <NotificationsActiveOutlinedIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
                  
                  {/* Profile Avatar & Logout */}
                  <Box display="flex" alignItems="center" gap={2} sx={{ ml: 1.5 }}>
                    <Avatar 
                      component={Link}
                      to="/profile"
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: 'secondary.main', 
                        color: 'primary.contrastText',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(123, 91, 61, 0.15)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Button 
                      variant="outlined" 
                      onClick={handleLogout}
                      size="small"
                      sx={{ py: 1, px: 2.5 }}
                    >
                      Logout
                    </Button>
                  </Box>
                </>
              ) : (
                <Box display="flex" gap={1} sx={{ ml: 1.5 }}>
                  <Button 
                    component={Link} 
                    to="/login" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'text.secondary',
                      px: 2.5,
                      py: 1,
                      '&:hover': { color: 'text.primary', backgroundColor: 'rgba(184, 138, 90, 0.06)' }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained" 
                    color="primary"
                    sx={{ 
                      px: 3,
                      py: 1,
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Menu Icon */}
          {isMobile && (
            <Box display="flex" alignItems="center" gap={1}>
              {isAuthenticated && (
                <IconButton 
                  component={Link} 
                  to="/notifications" 
                  sx={{ 
                    color: isActive('/notifications') ? 'secondary.main' : 'text.secondary',
                    p: 1
                  }}
                >
                  <Badge color="error" badgeContent={unreadCount}>
                    <NotificationsActiveOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              )}
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ 
                  color: 'text.primary', 
                  p: 1,
                  borderRadius: '10px',
                  border: '1px solid rgba(231, 221, 209, 0.6)'
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#FFFCF8',
            borderLeft: '1px solid #E7DDD1',
            boxShadow: '0 20px 50px rgba(123, 91, 61, 0.12)',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800 }}>
            RecoverAI
          </Typography>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ border: '1px solid #E7DDD1', borderRadius: '10px' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton 
                component={Link} 
                to={link.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: '10px',
                  backgroundColor: isActive(link.path) ? 'rgba(184, 138, 90, 0.08)' : 'transparent',
                  color: isActive(link.path) ? 'secondary.main' : 'text.primary',
                  '&:hover': { backgroundColor: 'rgba(184, 138, 90, 0.06)' }
                }}
              >
                <ListItemText 
                  primary={link.label} 
                  primaryTypographyProps={{ style: { fontWeight: 600, fontSize: '0.95rem' } }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
          
          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/profile"
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: '10px',
                  backgroundColor: isActive('/profile') ? 'rgba(184, 138, 90, 0.08)' : 'transparent',
                  color: isActive('/profile') ? 'secondary.main' : 'text.primary',
                }}
              >
                <ListItemText 
                  primary="My Profile" 
                  primaryTypographyProps={{ style: { fontWeight: 600, fontSize: '0.95rem' } }} 
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <Box display="flex" flexDirection="column" gap={1.5} mt="auto">
          {isAuthenticated ? (
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleLogout}
              sx={{ py: 1.25 }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined"
                fullWidth 
                onClick={() => setMobileOpen(false)}
                sx={{ py: 1.25 }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                variant="contained" 
                color="primary"
                fullWidth 
                onClick={() => setMobileOpen(false)}
                sx={{ py: 1.25 }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};
