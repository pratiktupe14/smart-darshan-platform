const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  visitorLimit: {
    type: Number,
    default: 50000,
  },
  isEmergencyActive: {
    type: Boolean,
    default: false,
  },
  parkingCapacity: {
    type: Number,
    default: 1000, // max parking spots
  },
  parkingOccupancy: {
    type: Number,
    default: 0,
  },
  templeName: {
    type: String,
    default: "शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
