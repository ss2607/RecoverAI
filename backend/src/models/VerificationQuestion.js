const mongoose = require('mongoose');

const verificationQuestionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  expectedAnswer: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('VerificationQuestion', verificationQuestionSchema);
