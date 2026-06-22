const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  placeCity: {
    type: String,
    required: true,
  },
  persons: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  vehicleType: {
    type: String,
    enum: ['none', 'two_wheeler', 'four_wheeler', 'bus'],
    default: 'none',
  },
  vehicleNumber: {
    type: String,
  },
  darshanDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  qrCode: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional, since booking might be guest or authenticated
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
