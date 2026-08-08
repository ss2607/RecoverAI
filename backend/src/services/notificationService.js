const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.createNotification = async (userId, message, type = 'info', relatedId = null) => {
  const notification = new Notification({
    user: userId,
    message,
    type,
    relatedId: relatedId || new mongoose.Types.ObjectId()
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
