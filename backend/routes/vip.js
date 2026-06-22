const express = require('express');
const router = express.Router();
const VIPRequest = require('../models/VIPRequest');

router.get('/', async (req, res) => {
  try {
    const reqs = await VIPRequest.find().sort({ createdAt: -1 });
    res.json(reqs);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category } = req.body;
    const v = new VIPRequest({ name, category });
    await v.save();
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const v = await VIPRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
