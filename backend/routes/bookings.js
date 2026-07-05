const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length !== 12) return aadhaar;
  return 'XXXX XXXX ' + aadhaar.substring(8);
};

// Create a booking
router.post('/', async (req, res) => {
  try {
    const { fullName, mobile, aadhaarNumber, placeCity, persons, visitors, vehicleType, vehicleNumber, darshanDate, userId } = req.body;
    
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ error: 'Valid 12-digit Aadhaar number is required.' });
    }

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

    console.log(`[POST /bookings] Creating new booking. userId: ${userId || 'none'}, mobile: ${mobile}, name: ${fullName}`);
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
    if (userId && userId !== 'none') {
      newBooking.userId = userId;
      
      // Automatically update user's mobileNumber in User profile if not set
      const User = require('../models/User');
      const user = await User.findById(userId);
      if (user && !user.mobileNumber) {
        user.mobileNumber = mobile;
        await user.save();
        console.log(`[POST /bookings] Automatically updated user ${userId} mobileNumber to ${mobile}`);
      }
    } else {
      // Try to associate booking with existing user if mobile matches
      const User = require('../models/User');
      const user = await User.findOne({ mobileNumber: mobile });
      if (user) {
        newBooking.userId = user._id;
        console.log(`[POST /bookings] Associated guest booking with user ID ${user._id} via mobile match`);
      }
    }

    const savedBooking = await newBooking.save();
    console.log(`[POST /bookings] Saved booking successfully:`, savedBooking._id, 'Token QR:', savedBooking.qrCode);
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
    const maskedBookings = bookings.map(b => {
      const obj = b.toObject ? b.toObject() : b;
      if (obj.aadhaarNumber) obj.aadhaarNumber = maskAadhaar(obj.aadhaarNumber);
      return obj;
    });
    res.json(maskedBookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get bookings by user mobile or userId
router.get('/user/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    console.log(`[GET /bookings/user/${identifier}] Querying bookings...`);
    const query = [{ mobile: identifier }];
    
    // Only query by userId if the identifier is a valid ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      query.push({ userId: identifier });
      
      // Look up user to also search bookings by user's registered mobile number
      const User = require('../models/User');
      const user = await User.findById(identifier);
      if (user) {
        console.log(`[GET /bookings/user/${identifier}] Found user for ID in DB:`, user._id, 'Mobile:', user.mobileNumber);
        if (user.mobileNumber) {
          query.push({ mobile: user.mobileNumber });
        }
      }
    } else {
      // If identifier is a mobile number, also find the user with this mobile number and query by their userId
      const User = require('../models/User');
      const user = await User.findOne({ mobileNumber: identifier });
      if (user) {
        console.log(`[GET /bookings/user/${identifier}] Found user for Mobile in DB:`, user._id);
        query.push({ userId: user._id });
      }
    }

    console.log(`[GET /bookings/user/${identifier}] Query formulated:`, JSON.stringify(query));
    const bookings = await Booking.find({
      $or: query
    }).sort({ createdAt: -1 });
    
    console.log(`[GET /bookings/user/${identifier}] Successfully found bookings count: ${bookings.length}`);
    const maskedBookings = bookings.map(b => {
      const obj = b.toObject ? b.toObject() : b;
      if (obj.aadhaarNumber) obj.aadhaarNumber = maskAadhaar(obj.aadhaarNumber);
      return obj;
    });
    res.json(maskedBookings);
  } catch (err) {
    console.error(`[GET /bookings/user/${identifier}] Error:`, err.message);
    res.status(500).send('Server Error');
  }
});

// Verification Scanner Endpoint
// Verification Scanner Endpoint (Search-Only)
router.post('/verify-scanner', async (req, res) => {
  try {
    const { query, counterNumber } = req.body;
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
      const qEntry = await Queue.findOne({ tokenNumber: new RegExp('^' + searchTokenNumber + '$', 'i') }).sort({ checkInTime: -1 }).populate('bookingId');
      if (qEntry && qEntry.bookingId) {
        booking = qEntry.bookingId;
      } else {
        booking = await Booking.findOne({ qrCode: new RegExp('^' + searchTokenNumber + '$', 'i') });
      }
    }

    if (!booking) {
      return res.status(404).json({ error: 'No booking found.' });
    }

    // Note: status-specific validation is now processed when committing actions, not when scanning/searching.

    // Find corresponding queue entry to see if a token is assigned
    const Queue = require('../models/Queue');
    const queueEntry = await Queue.findOne({ bookingId: booking._id });
    const tokenNumber = queueEntry ? queueEntry.tokenNumber : (booking.qrCode ? booking.qrCode.split('-')[1] : 'N/A');

    res.json({
      message: 'Devotee verified successfully!',
      booking: {
        ...booking.toObject(),
        aadhaarNumber: booking.aadhaarNumber ? maskAadhaar(booking.aadhaarNumber) : undefined,
        tokenNumber
      }
    });
  } catch (err) {
    console.error('Verify scanner error:', err);
    res.status(500).json({ error: 'Server Error during scanner verification.' });
  }
});

// Counter Verification Actions
router.post('/verify-scanner/action', async (req, res) => {
  try {
    const { bookingId, counterNumber, staffName } = req.body;
    if (!bookingId || !counterNumber) {
      return res.status(400).json({ error: 'Booking ID and Counter Number are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    let statusLabel = '';
    let nextVerificationStatus = '';

    if (counterNumber === 1) {
      // Counter 1: Temple Entry -> Verified Entry
      if (booking.verificationStatus === 'verified_entry' || booking.verificationStatus === 'in_queue' || booking.verificationStatus === 'completed') {
        return res.status(400).json({ error: 'Temple Entry is already completed.' });
      }
      booking.verificationStatus = 'verified_entry';
      booking.enteredTemple = 'Yes';
      statusLabel = 'Temple Entry Completed';
      nextVerificationStatus = 'verified_entry';
    } else if (counterNumber === 2) {
      // Counter 2: Queue Entry -> In Queue
      if (booking.verificationStatus !== 'verified_entry') {
        if (booking.verificationStatus === 'in_queue' || booking.verificationStatus === 'completed') {
          return res.status(400).json({ error: 'Visitor is already marked In Queue or Completed.' });
        }
        return res.status(400).json({ error: 'Cannot mark in queue. Visitor must complete Temple Entry (Counter 1) first.' });
      }
      booking.verificationStatus = 'in_queue';
      statusLabel = 'Waiting in Queue';
      nextVerificationStatus = 'in_queue';

      // Add to Queue collection if not exists
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
    } else if (counterNumber === 3) {
      // Counter 3: Darshan Completion -> Completed
      if (booking.verificationStatus !== 'in_queue') {
        if (booking.verificationStatus === 'completed') {
          return res.status(400).json({ error: 'Darshan is already completed.' });
        }
        return res.status(400).json({ error: 'Cannot complete Darshan. Visitor must be in queue (Counter 2) first.' });
      }
      booking.verificationStatus = 'completed';
      booking.status = 'completed';
      booking.darshanCompletedAt = new Date();
      statusLabel = 'Darshan Completed';
      nextVerificationStatus = 'completed';

      // Update corresponding Queue entry
      const Queue = require('../models/Queue');
      let queueEntry = await Queue.findOne({ bookingId: booking._id });
      if (queueEntry) {
        queueEntry.status = 'completed';
        await queueEntry.save();
      }
    } else {
      return res.status(400).json({ error: 'Invalid Counter Number.' });
    }

    // Initialize counterHistory if not exists
    if (!booking.counterHistory) {
      booking.counterHistory = [];
    }

    // Add record to counterHistory
    booking.counterHistory.push({
      counterNumber,
      status: statusLabel,
      timestamp: new Date(),
      staffName: staffName || 'Staff Member'
    });

    await booking.save();

    // Find updated token number
    const Queue = require('../models/Queue');
    const queueEntry = await Queue.findOne({ bookingId: booking._id });
    const tokenNumber = queueEntry ? queueEntry.tokenNumber : (booking.qrCode ? booking.qrCode.split('-')[1] : 'N/A');

    res.json({
      message: `Successfully updated status to: ${statusLabel}!`,
      booking: {
        ...booking.toObject(),
        aadhaarNumber: booking.aadhaarNumber ? maskAadhaar(booking.aadhaarNumber) : undefined,
        tokenNumber
      }
    });
  } catch (err) {
    console.error('Counter action error:', err);
    res.status(500).json({ error: 'Server Error during counter action processing.' });
  }
});

// Get recent scans for a specific counter
router.get('/verify-scanner/recent/:counterNumber', async (req, res) => {
  try {
    const counterNumber = parseInt(req.params.counterNumber);
    if (!counterNumber) {
      return res.status(400).json({ error: 'Counter Number is required.' });
    }

    // Find bookings where counterHistory has this counterNumber
    const bookings = await Booking.find({
      'counterHistory.counterNumber': counterNumber
    }).lean();

    const recentScans = bookings.map(b => {
      // Find the latest specific history entry for this counter
      const historyEntries = b.counterHistory.filter(h => h.counterNumber === counterNumber);
      historyEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const historyEntry = historyEntries[0];

      return {
        name: b.fullName,
        persons: b.persons,
        gate: b.gateNo || 'Main Gate',
        time: historyEntry ? new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        status: historyEntry ? historyEntry.status : 'Verified',
        timestamp: historyEntry ? new Date(historyEntry.timestamp) : new Date(0)
      };
    });

    // Sort the mapped results descending by the specific counter timestamp
    recentScans.sort((a, b) => b.timestamp - a.timestamp);

    res.json(recentScans.slice(0, 10)); // return top 10
  } catch (err) {
    console.error('Recent scans error:', err);
    res.status(500).json({ error: 'Server Error fetching recent scans.' });
  }
});

// Cancel a booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    
    // Only allow cancellation if booking is confirmed and hasn't started the journey
    if (booking.status !== 'confirmed' || (booking.verificationStatus && booking.verificationStatus !== 'none')) {
      return res.status(400).json({ error: 'Cannot cancel this booking. The journey has already started or it is not active.' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    
    // Update queue status if applicable (just in case they somehow got into the queue)
    const Queue = require('../models/Queue');
    const queueEntry = await Queue.findOne({ bookingId: booking._id });
    if (queueEntry) {
      queueEntry.status = 'cancelled';
      await queueEntry.save();
    }

    await booking.save();
    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Server Error during cancellation.' });
  }
});

module.exports = router;
