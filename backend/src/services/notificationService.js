const Notification = require('../models/Notification');

exports.createNotification = async (userId, title, message, type = 'info') => {
  const notification = new Notification({
    user: userId,
    title,
    message,
    type
  });
  return notification.save();
};

exports.getUserNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

exports.markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};
