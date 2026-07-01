import React, { useEffect, useState, useContext } from 'react';
import { notificationService } from '../services/notificationService';
import { AuthContext } from '../../auth/context/AuthContext';
import { NotificationList } from '../components/NotificationList';

export const NotificationsPage = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      notificationService.getNotifications(token).then(setNotifications).catch(console.error);
    }
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (token) {
      await notificationService.markAsRead(token, id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  return (
    <div>
      <h1>Notifications</h1>
      <NotificationList notifications={notifications} onMarkAsRead={handleMarkAsRead} />
    </div>
  );
};
