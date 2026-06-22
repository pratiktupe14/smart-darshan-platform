const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'committee', 'vip'],
    default: 'user',
  },
  fullName: {
    type: String,
    required: false,
  },
  mobileNumber: {
    type: String,
    required: false,
  },
  profilePhoto: {
    type: String,
    required: false,
  },
  placeCityVillage: {
    type: String,
    required: false,
  },
  preferredLanguage: {
    type: String,
    default: 'en',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
