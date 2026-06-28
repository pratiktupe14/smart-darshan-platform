const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SupportRequest = require('../models/SupportRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  next();
};

const adminAuth = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin only.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a support request
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, mobileNumber, email, subject, message } = req.body;
    
    const supportReq = new SupportRequest({
      user: req.user ? req.user.id : undefined,
      fullName,
      mobileNumber,
      email,
      subject,
      message
    });

    await supportReq.save();

    // Notify admins about the new support request
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      user: admin._id,
      title: 'New Support Request',
      message: `A new support request has been submitted by ${fullName}. Subject: ${subject}`,
      type: 'System Notifications'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(supportReq);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's support requests
router.get('/user', auth, requireAuth, async (req, res) => {
  try {
    const supportReqs = await SupportRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(supportReqs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all support requests (Admin)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const supportReqs = await SupportRequest.find().populate('user', 'fullName email').sort({ createdAt: -1 });
    res.json(supportReqs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a support request (Admin)
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const supportReq = await SupportRequest.findById(req.params.id);
    
    if (!supportReq) {
      return res.status(404).json({ message: 'Support request not found' });
    }

    if (status) supportReq.status = status;
    if (adminReply) supportReq.adminReply = adminReply;

    await supportReq.save();

    // Notify the user if they are registered
    if (supportReq.user) {
      const notification = new Notification({
        user: supportReq.user,
        title: 'Support Request Updated',
        message: `Your support request "${supportReq.subject}" has been updated. Status: ${supportReq.status}.`,
        type: 'System Notifications'
      });
      await notification.save();
    }

    res.json(supportReq);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
