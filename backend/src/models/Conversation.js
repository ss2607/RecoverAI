const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    unique: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCountOwner: {
    type: Number,
    default: 0
  },
  unreadCountClaimant: {
    type: Number,
    default: 0
  },
  meetingLocation: {
    type: String,
    default: ''
  },
  meetingTime: {
    type: String,
    default: ''
  },
  meetingStatus: {
    type: String,
    enum: ['awaiting_meeting', 'scheduled', 'completed'],
    default: 'awaiting_meeting'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
