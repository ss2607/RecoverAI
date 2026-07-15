const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  brand: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  dateLostFound: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
  aiTags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'matched', 'claimed', 'returned', 'closed', 'claim_pending', 'awaiting_exchange'],
    default: 'open'
  },
  verificationQuestions: [{
    question: {
      type: String,
      required: true
    }
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
