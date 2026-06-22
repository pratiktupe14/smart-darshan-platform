const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a booking
router.post('/', async (req, res) => {
  try {
    const { fullName, mobile, placeCity, persons, visitors, vehicleType, vehicleNumber, darshanDate, userId } = req.body;
    
    // Validate booking day (Sunday, Monday, Tuesday only)
    if (!darshanDate) {
      return res.status(400).json({ error: 'Darshan date is required.' });
    }
    const parts = darshanDate.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday
      if (day !== 0 && day !== 1 && day !== 2) {
        return res.status(400).json({ error: 'Darshan booking is only allowed on Sunday, Monday, and Tuesday.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    const newBooking = new Booking({
      fullName,
      mobile,
      placeCity,
      persons,
      visitors,
      vehicleType,
      vehicleNumber,
      darshanDate,
      qrCode: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    });
    if (userId) {
      newBooking.userId = userId;
    }

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error('Database Error during booking:', err.message, err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation Error', details: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Database Cast Error', details: err.message });
    }
    res.status(500).json({ error: 'Database Server Error', details: err.message });
  }
});

// Get all bookings (optional: for admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get bookings by user mobile or userId
router.get('/user/:identifier', async (req, res) => {
  try {
    // Identifier could be mobile number or userId
    const bookings = await Booking.find({
      $or: [
        { mobile: req.params.identifier },
        { userId: req.params.identifier }
      ]
    }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Verification Scanner Endpoint
router.post('/verify-scanner', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query or QR data is required.' });
    }

    let searchBookingId = null;
    let searchTokenNumber = null;
    let searchQrCode = null;
    let searchMobile = null;

    // 1. Try to parse JSON (e.g. from QR code in MyPass)
    try {
      const parsed = JSON.parse(query);
      if (parsed.bookingId) searchBookingId = parsed.bookingId;
      if (parsed.token) searchTokenNumber = parsed.token;
      if (parsed.mobile) searchMobile = parsed.mobile;
    } catch (e) {
      // Not JSON
      // 2. Try to parse TOKEN-tokenNumber-bookingId format (e.g. from QR code in Dashboard)
      if (query.startsWith('TOKEN-')) {
        const parts = query.split('-');
        if (parts.length >= 3) {
          searchTokenNumber = parts[1];
          searchBookingId = parts[2];
        }
      } else if (query.startsWith('QR-')) {
        searchQrCode = query;
      } else if (/^[0-9a-fA-F]{24}$/.test(query)) {
        searchBookingId = query;
      } else if (/^\+?[0-9]{10,15}$/.test(query)) {
        searchMobile = query;
      } else {
        searchTokenNumber = query;
      }
    }

    // 3. Find the booking in the database
    let booking = null;
    if (searchBookingId) {
      booking = await Booking.findById(searchBookingId);
    }
    if (!booking && searchQrCode) {
      booking = await Booking.findOne({ qrCode: searchQrCode });
    }
    if (!booking && searchMobile) {
      booking = await Booking.findOne({ mobile: searchMobile, status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });
    }
    if (!booking && searchTokenNumber && searchTokenNumber !== 'N/A') {
      const Queue = require('../models/Queue');
      const qEntry = await Queue.findOne({ tokenNumber: searchTokenNumber }).populate('bookingId');
      if (qEntry && qEntry.bookingId) {
        booking = qEntry.bookingId;
      } else {
        booking = await Booking.findOne({ qrCode: searchTokenNumber });
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'Devotee / Booking record not found.' });
    }

    const currentStatus = booking.verificationStatus || 'none';

    // 4. Perform the automatic state transitions based on current status
    if (currentStatus === 'none') {
      // First Verification Scan -> Verified Entry
      booking.verificationStatus = 'verified_entry';
      booking.enteredTemple = 'Yes';
      await booking.save();

      return res.json({
        message: 'Successfully verified temple entry!',
        booking,
        nextAction: 'Verify Entry',
        buttonStates: {
          verifyEntry: true,
          markInQueue: false,
          darshanCompleted: false
        }
      });
    } else if (currentStatus === 'verified_entry') {
      // Second Verification Scan -> In Queue
      booking.verificationStatus = 'in_queue';
      await booking.save();

      // Ensure they are added to the Queue collection if not already present
      const Queue = require('../models/Queue');
      let queueEntry = await Queue.findOne({ bookingId: booking._id });
      if (!queueEntry) {
        const allQueue = await Queue.find();
        const allNums = allQueue.map(item => {
          const clean = item.tokenNumber.replace(/[^0-9]/g, '');
          return parseInt(clean);
        }).filter(num => !isNaN(num));
        const nextNum = allNums.length > 0 ? Math.max(...allNums) + 1 : 1025;
        const newTokenId = `A${String(nextNum).padStart(3, '0')}`;

        queueEntry = new Queue({
          tokenNumber: newTokenId,
          isVip: false,
          bookingId: booking._id,
          userId: booking.userId,
          status: 'waiting'
        });
        await queueEntry.save();
      } else {
        if (queueEntry.status !== 'waiting' && queueEntry.status !== 'serving') {
          queueEntry.status = 'waiting';
          await queueEntry.save();
        }
      }

      return res.json({
        message: 'Devotee marked in queue successfully!',
        booking,
        queueEntry,
        nextAction: 'Mark In Queue',
        buttonStates: {
          verifyEntry: false,
          markInQueue: true,
          darshanCompleted: false
        }
      });
    } else if (currentStatus === 'in_queue') {
      // Third Verification Scan -> Darshan Completed
      booking.verificationStatus = 'completed';
      booking.status = 'completed';
      booking.darshanCompletedAt = new Date();
      await booking.save();

      // Update corresponding Queue entry to completed
      const Queue = require('../models/Queue');
      let queueEntry = await Queue.findOne({ bookingId: booking._id });
      if (queueEntry) {
        queueEntry.status = 'completed';
        await queueEntry.save();
      }

      return res.json({
        message: 'Darshan completed successfully!',
        booking,
        queueEntry,
        nextAction: 'Darshan Completed',
        buttonStates: {
          verifyEntry: false,
          markInQueue: false,
          darshanCompleted: true
        }
      });
    } else if (currentStatus === 'completed' || booking.status === 'completed') {
      // Already completed -> Prevent duplicate scan/verification
      return res.status(400).json({
        error: 'Darshan already completed for this devotee. Duplicate verification prevented.',
        booking,
        duplicate: true
      });
    } else {
      return res.status(400).json({ error: 'Invalid verification state.' });
    }
  } catch (err) {
    console.error('Verify scanner error:', err);
    res.status(500).json({ error: 'Server Error during scanner verification.' });
  }
});

module.exports = router;
