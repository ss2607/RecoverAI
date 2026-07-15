import { useEffect, useState, useContext, Fragment } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { AuthContext } from '../../auth/context/AuthContext';
import { 
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  NotificationsActiveOutlined as NotificationsActiveOutlinedIcon,
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { socketService } from '../../../services/socketService';

export const NotificationsPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
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

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });
    };

    socketService.on('notification_created', handleNewNotification);

    return () => {
      socketService.off('notification_created', handleNewNotification);
    };
  }, [token]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
    // Navigate directly to claim review or corresponding details
    navigate(`/claims/${notification.relatedId}`);
  };

  const getNotificationTypeDetails = (type: string) => {
    switch (type) {
      case 'claim_approved':
        return {
          title: 'Claim Approved',
          icon: <SuccessIcon sx={{ color: '#4F8A5B' }} />
        };
      case 'claim_rejected':
        return {
          title: 'Claim Rejected',
          icon: <ErrorIcon sx={{ color: '#B24C4C' }} />
        };
      case 'needs_info':
        return {
          title: 'More Information Requested',
          icon: <WarningIcon sx={{ color: '#D59B3A' }} />
        };
      case 'new_claim':
      case 'claim_submitted':
        return {
          title: 'New Claim Received',
          icon: <InfoIcon sx={{ color: '#B88A5A' }} />
        };
      case 'item_returned':
        return {
          title: 'Item Exchange Verified',
          icon: <SuccessIcon sx={{ color: '#2E6CB5' }} />
        };
      default:
        return {
          title: 'Alert Notification',
          icon: <NotificationsActiveOutlinedIcon sx={{ color: '#B88A5A' }} />
        };
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
          {notifications.map((notification, index) => {
            const { title: typeTitle, icon } = getNotificationTypeDetails(notification.type);
            const displayTitle = notification.title || typeTitle;

            return (
              <Fragment key={notification._id}>
                <Box 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : 'rgba(198, 162, 126, 0.05)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: notification.read ? 'rgba(0,0,0,0.01)' : 'rgba(198, 162, 126, 0.08)'
                    }
                  }}
                >
                  <Box display="flex" gap={2}>
                    <Box sx={{ mt: 0.5 }}>{icon}</Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={notification.read ? 500 : 700} gutterBottom>
                        {displayTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  {!notification.read && (
                    <IconButton 
                      onClick={(e) => handleMarkAsRead(notification._id, e)} 
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
            );
          })}
        </Paper>
      )}
    </Container>
  );
};
