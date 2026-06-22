const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tokenNumber: {
    type: String,
    required: true,
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'skipped'],
    default: 'waiting',
  },
  isVip: {
    type: Boolean,
    default: false,
  },
  calledAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Queue', queueSchema);
