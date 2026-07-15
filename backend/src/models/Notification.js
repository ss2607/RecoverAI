const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

notificationSchema.pre('save', function(next) {
  this.isNewDocument = this.isNew;
  next();
});

notificationSchema.post('save', function(doc) {
  if (doc.isNewDocument) {
    try {
      const { emitToUser } = require('../config/socket');
      emitToUser(doc.user.toString(), 'notification_created', doc);
    } catch (err) {
      console.error('Error emitting socket notification:', err);
    }
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
