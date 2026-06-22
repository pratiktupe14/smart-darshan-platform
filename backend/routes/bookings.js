const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a booking
router.post('/', async (req, res) => {
  try {
    const { fullName, mobile, placeCity, persons, vehicleType, vehicleNumber, darshanDate, userId } = req.body;
    
    const newBooking = new Booking({
      fullName,
      mobile,
      placeCity,
      persons,
      vehicleType,
      vehicleNumber,
      darshanDate,
      userId,
      qrCode: `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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

module.exports = router;
