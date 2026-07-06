const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be user ID or mobile number if not logged in
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  purpose: {
    type: String,
    required: true,
    enum: ['General Fund', 'Annadan', 'Goshala', 'Temple Maintenance', 'Festival Fund']
  },
  panNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Completed', 'Failed']
  },
  paymentMethod: {
    type: String,
    default: 'UPI'
  },
  transactionId: {
    type: String,
    required: true
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
