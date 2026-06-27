const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Darshan Booking Confirmed',
      'Pass Generated',
      'Temple Entry Completed',
      'Waiting in Queue',
      'Queue Status Updated',
      'Darshan Completed',
      'Booking Cancelled',
      'Announcements from Admin',
      'System Notifications'
    ],
    default: 'System Notifications'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
