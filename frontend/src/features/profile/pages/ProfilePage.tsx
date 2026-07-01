import { useEffect, useState, useContext } from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar, Button, Divider, CircularProgress } from '@mui/material';
import { AuthContext } from '../../auth/context/AuthContext';
import { profileService } from '../services/profileService';
import { Link } from 'react-router-dom';
import { 
  PersonOutlined as PersonOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
  LockOutlined as LockOutlinedIcon
} from '@mui/icons-material';

export const ProfilePage = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token) {
          const data = await profileService.getProfile(token);
          setProfile(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={40} thickness={4} />
    </Box>
  );
  if (error) return <Typography color="error" align="center" sx={{ mt: 8 }}>{error}</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        Account Settings
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>{profile?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{profile?.role.toUpperCase()}</Typography>
            
            <Button component={Link} to="/profile/edit" variant="outlined" fullWidth startIcon={<EditOutlinedIcon />} sx={{ mb: 2 }}>
              Edit Profile
            </Button>
            <Button component={Link} to="/profile/change-password" variant="text" fullWidth color="inherit" startIcon={<LockOutlinedIcon />}>
              Change Password
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Personal Information</Typography>
            <Divider sx={{ mb: 4 }} />
            
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'background.default', color: 'primary.main' }}>
                <PersonOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" fontWeight="500">{profile?.name}</Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={3}>
              <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'background.default', color: 'primary.main' }}>
                <EmailOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Email Address</Typography>
                <Typography variant="body1" fontWeight="500">{profile?.email}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
