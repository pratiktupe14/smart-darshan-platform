const mongoose = require('mongoose');

const vipRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  persons: {
    type: Number,
    required: true,
    min: 1,
  },
  expectedArrivalTime: {
    type: Date,
    required: true,
  },
  tokenNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Pass Generated', 'Darshan Completed'],
    default: 'Pass Generated',
  },
  darshanCompletedAt: {
    type: Date,
  },
  idProof: {
    type: String,
  },
  priorityLevel: {
    type: String,
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VIPRequest', vipRequestSchema);
