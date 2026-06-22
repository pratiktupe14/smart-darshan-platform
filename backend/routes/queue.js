const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');

// Get current live queue
router.get('/', async (req, res) => {
  try {
    const q = await Queue.find({ status: { $in: ['waiting', 'serving'] } })
      .populate('bookingId')
      .populate('userId')
      .sort({ isVip: -1, checkInTime: 1 }); // VIPs first, then by time
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Call next token
router.post('/next', async (req, res) => {
  try {
    // End current serving
    await Queue.updateMany({ status: 'serving' }, { status: 'completed' });
    
    // Get next
    const next = await Queue.findOne({ status: 'waiting' }).sort({ isVip: -1, checkInTime: 1 });
    if (next) {
      next.status = 'serving';
      next.calledAt = new Date();
      await next.save();
    }
    res.json(next);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Skip token
router.post('/skip', async (req, res) => {
  try {
    // The current serving gets skipped
    await Queue.updateMany({ status: 'serving' }, { status: 'skipped' });
    
    // Get next
    const next = await Queue.findOne({ status: 'waiting' }).sort({ isVip: -1, checkInTime: 1 });
    if (next) {
      next.status = 'serving';
      next.calledAt = new Date();
      await next.save();
    }
    res.json(next);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Push a specific token next (for VIPs)
router.post('/push/:id', async (req, res) => {
  try {
    const item = await Queue.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    item.isVip = true;
    item.checkInTime = new Date(0);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add to queue manually
router.post('/', async (req, res) => {
  try {
    const { tokenNumber, isVip, bookingId, userId } = req.body;
    const q = new Queue({ tokenNumber, isVip, bookingId, userId });
    await q.save();
    res.json(q);
  } catch(err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Remove from queue
router.delete('/:id', async (req, res) => {
  try {
    await Queue.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Edit queue entry
router.put('/:id', async (req, res) => {
  try {
    const { isVip, tokenNumber } = req.body;
    const q = await Queue.findByIdAndUpdate(req.params.id, { isVip, tokenNumber }, { new: true });
    res.json(q);
  } catch(err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
