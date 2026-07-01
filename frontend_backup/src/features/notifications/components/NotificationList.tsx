import React from 'react';

interface NotificationListProps {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkAsRead }) => {
  return (
    <ul>
      {notifications.map((n) => (
        <li key={n._id} style={{ opacity: n.isRead ? 0.5 : 1 }}>
          <h4>{n.title}</h4>
          <p>{n.message}</p>
          {!n.isRead && <button onClick={() => onMarkAsRead(n._id)}>Mark as Read</button>}
        </li>
      ))}
    </ul>
  );
};
