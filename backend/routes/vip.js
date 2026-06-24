const express = require('express');
const router = express.Router();
const VIPRequest = require('../models/VIPRequest');

// Get all VIP entries
router.get('/', async (req, res) => {
  try {
    const reqs = await VIPRequest.find().sort({ createdAt: -1 });
    res.json(reqs);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Create new VIP entry
router.post('/', async (req, res) => {
  try {
    const { name, mobileNumber, category, persons, expectedArrivalTime, idProof, priorityLevel, remarks } = req.body;
    
    // Generate a unique VIP token
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `VIP-${timestamp}${random}`;
    
    const v = new VIPRequest({
      name,
      mobileNumber,
      category,
      persons,
      expectedArrivalTime,
      tokenNumber,
      idProof,
      priorityLevel,
      remarks,
      status: 'Pass Generated'
    });
    
    await v.save();
    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Edit VIP details
router.put('/:id', async (req, res) => {
  try {
    const v = await VIPRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Complete Darshan
router.put('/:id/complete', async (req, res) => {
  try {
    const v = await VIPRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'Darshan Completed', darshanCompletedAt: new Date() },
      { new: true }
    );
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Delete VIP entry
router.delete('/:id', async (req, res) => {
  try {
    await VIPRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
