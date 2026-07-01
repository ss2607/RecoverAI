import { useEffect, useState, useContext, Fragment } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, IconButton, Divider } from '@mui/material';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { AuthContext } from '../../auth/context/AuthContext';
import { 
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  NotificationsActiveOutlined as NotificationsActiveOutlinedIcon
} from '@mui/icons-material';

export const NotificationsPage = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (token) {
          const data = await notificationService.getNotifications(token);
          setNotifications(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      if (token) {
        await notificationService.markAsRead(token, id);
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, read: true } : n
        ));
      }
    } catch (err: any) {
      console.error('Error marking notification as read', err);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={40} thickness={4} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <NotificationsActiveOutlinedIcon />
        </Box>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Notifications
        </Typography>
      </Box>

      {error ? (
        <Typography color="error" align="center" sx={{ mt: 8 }}>{error}</Typography>
      ) : notifications.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary">You're all caught up!</Typography>
          <Typography color="text.secondary">No new notifications at this time.</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {notifications.map((notification, index) => (
            <Fragment key={notification._id}>
              <Box 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  bgcolor: notification.read ? 'transparent' : 'rgba(198, 162, 126, 0.05)',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: notification.read ? 'rgba(0,0,0,0.01)' : 'rgba(198, 162, 126, 0.08)'
                  }
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={notification.read ? 500 : 700} gutterBottom>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {!notification.read && (
                  <IconButton 
                    onClick={() => handleMarkAsRead(notification._id)} 
                    color="primary"
                    title="Mark as read"
                    sx={{ ml: 2 }}
                  >
                    <CheckCircleOutlinedIcon />
                  </IconButton>
                )}
              </Box>
              {index < notifications.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Paper>
      )}
    </Container>
  );
};
