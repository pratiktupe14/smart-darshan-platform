const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Queue = require('../models/Queue');

router.get('/', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    
    // bookingsToday
    const bookingsToday = await Booking.countDocuments({ createdAt: { $gte: startOfDay } });
    
    // visitorsToday (sum of persons in today's bookings)
    const todaysBookings = await Booking.find({ createdAt: { $gte: startOfDay } });
    let visitorsToday = 0;
    todaysBookings.forEach(b => visitorsToday += (b.persons || 1));
    
    // visitorsInside (say, sum of persons in queue where status is waiting or serving)
    const queueInside = await Queue.find({ status: { $in: ['waiting', 'serving'] } }).populate('bookingId');
    let visitorsInside = 0;
    let vipVisitors = 0;
    queueInside.forEach(q => {
      const p = q.bookingId ? q.bookingId.persons : 1;
      visitorsInside += p;
      if (q.isVip) vipVisitors += p;
    });
    
    const queueCount = queueInside.length;
    
    // completedDarshans
    const completedDarshans = await Queue.countDocuments({ status: 'completed' });
    
    // cancelledBookings
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    res.json({
      bookingsToday,
      visitorsToday,
      visitorsInside,
      queueCount,
      vipVisitors,
      completedDarshans,
      cancelledBookings,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
