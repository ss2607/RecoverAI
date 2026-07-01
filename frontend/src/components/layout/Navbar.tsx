import { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Badge, IconButton } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../features/auth/context/AuthContext';
import { NotificationsActiveOutlined as NotificationsActiveOutlinedIcon } from '@mui/icons-material';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    fontWeight: 700,
    fontSize: '0.9rem',
    color: isActive(path) ? 'secondary.main' : 'text.secondary',
    px: 1.5,
    py: 0.8,
    borderRadius: '8px',
    transition: 'all 0.2s',
    '&:hover': {
      color: 'text.primary',
      backgroundColor: 'rgba(139, 111, 71, 0.04)'
    }
  });

  return (
    <AppBar position="sticky" elevation={0} sx={{ top: 0, zIndex: 1100 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1.5 }}>
          {/* Logo / Brand */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '8px', 
                bgcolor: 'primary.main', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'primary.contrastText',
                boxShadow: '0 2px 8px rgba(198, 162, 126, 0.3)'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>R</Typography>
            </Box>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                textDecoration: 'none',
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: '-0.5px'
              }}
            >
              RecoverAI
            </Typography>
          </Box>
          
          {/* Center/Right Nav links */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button component={Link} to="/items" sx={linkStyle('/items')}>
              Browse registry
            </Button>
            
            {isAuthenticated ? (
              <>
                <Button 
                  component={Link} 
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                  sx={linkStyle(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                >
                  Dashboard
                </Button>
                
                <Button component={Link} to="/matches" sx={linkStyle('/matches')}>
                  AI Matches
                </Button>

                {/* Notifications Link */}
                <IconButton 
                  component={Link} 
                  to="/notifications" 
                  sx={{ 
                    color: isActive('/notifications') ? 'secondary.main' : 'text.secondary',
                    '&:hover': { backgroundColor: 'rgba(139, 111, 71, 0.04)' },
                    ml: 0.5
                  }}
                >
                  <Badge color="error" variant="dot">
                    <NotificationsActiveOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
                
                {/* Profile Avatar & Logout */}
                <Box display="flex" alignItems="center" gap={1.5} sx={{ ml: 1.5 }}>
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
                      border: '1px solid rgba(139, 111, 71, 0.15)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleLogout}
                    size="small"
                    sx={{ py: 0.8, px: 2, borderRadius: '8px', fontWeight: 700 }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    px: 2.5,
                    py: 1
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
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: '8px'
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
