const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');

// Create a donation (Mock Payment Flow)
router.post('/', async (req, res) => {
  try {
    const { userId, fullName, mobile, amount, purpose, panNumber, address, paymentMethod } = req.body;
    
    // Mock Payment Success
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const receiptNumber = 'REC' + new Date().getFullYear() + Math.floor(10000 + Math.random() * 90000);
    
    const donation = new Donation({
      userId,
      fullName,
      mobile,
      amount,
      purpose,
      panNumber,
      address,
      paymentMethod: paymentMethod || 'UPI',
      status: 'Completed', // Mocking success
      transactionId,
      receiptNumber
    });
    
    await donation.save();
    res.json(donation);
  } catch (err) {
    console.error('Error creating donation:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get user donations
router.get('/user/:userId', async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all donations (for admin)
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get specific donation receipt
router.get('/receipt/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
