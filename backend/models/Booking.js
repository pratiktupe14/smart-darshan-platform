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
  aadhaarNumber: {
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
  visitors: [
    {
      name: { type: String, required: true },
      age: { type: Number, required: true }
    }
  ],
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
  verificationStatus: {
    type: String,
    enum: ['none', 'verified_entry', 'in_queue', 'completed'],
    default: 'none',
  },
  enteredTemple: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No',
  },
  darshanCompletedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  qrCode: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional, since booking might be guest or authenticated
  },
  counterHistory: [
    {
      counterNumber: { type: Number, required: true },
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      staffName: { type: String, required: true }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
