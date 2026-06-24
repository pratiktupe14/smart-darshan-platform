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
    
    // totalDevoteesInside (Status = verified_entry)
    const devoteesInside = await Booking.find({ verificationStatus: 'verified_entry' });
    let totalDevoteesInside = 0;
    devoteesInside.forEach(b => totalDevoteesInside += (b.persons || 1));

    // totalPendingEntries (Status = none)
    const pendingEntriesBookings = await Booking.find({ verificationStatus: 'none', status: { $ne: 'cancelled' } });
    let totalPendingEntries = 0;
    pendingEntriesBookings.forEach(b => totalPendingEntries += (b.persons || 1));

    // qrScansToday
    const bookingsWithHistory = await Booking.find({ 'counterHistory.timestamp': { $gte: startOfDay } });
    let qrScansToday = 0;
    bookingsWithHistory.forEach(b => {
      qrScansToday += b.counterHistory.filter(h => new Date(h.timestamp) >= startOfDay).length;
    });

    res.json({
      bookingsToday,
      visitorsToday,
      visitorsInside,
      queueCount,
      vipVisitors,
      completedDarshans,
      cancelledBookings,
      totalDevoteesInside,
      totalPendingEntries,
      qrScansToday,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get recent activities across all bookings
router.get('/activities', async (req, res) => {
  try {
    const bookings = await Booking.find({ 'counterHistory': { $not: { $size: 0 } } }).lean();
    let activities = [];
    bookings.forEach(b => {
      b.counterHistory.forEach(h => {
        activities.push({
          action: h.status,
          token: b.qrCode,
          time: new Date(h.timestamp),
          gate: `Counter ${h.counterNumber}`,
          name: b.fullName
        });
      });
    });
    
    // Sort descending by time
    activities.sort((a, b) => b.time - a.time);
    
    res.json(activities.slice(0, 10)); // Top 10 recent activities
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error fetching activities' });
  }
});

module.exports = router;
