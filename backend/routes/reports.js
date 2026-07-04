const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const VIPRequest = require('../models/VIPRequest');
const SupportRequest = require('../models/SupportRequest');
const User = require('../models/User');

// GET /api/reports/export
router.get('/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    let bookingQuery = {}; // Bookings might use darshanDate or createdAt
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      query = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      };
      
      bookingQuery = {
        darshanDate: {
          $gte: start,
          $lte: end
        }
      };
    }

    const bookings = await Booking.find(bookingQuery).sort({ darshanDate: -1 });
    const vipRequests = await VIPRequest.find(query).sort({ createdAt: -1 });
    const supportRequests = await SupportRequest.find(query).sort({ createdAt: -1 });
    
    // Generate daily summary for charts
    const dailyBookingsMap = {};
    const monthlyBookingsMap = {};
    let completedCount = 0;
    let cancelledCount = 0;
    
    bookings.forEach(b => {
      const date = new Date(b.darshanDate || b.createdAt);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
      
      if (!dailyBookingsMap[dayKey]) dailyBookingsMap[dayKey] = 0;
      dailyBookingsMap[dayKey]++;
      
      if (!monthlyBookingsMap[monthKey]) monthlyBookingsMap[monthKey] = 0;
      monthlyBookingsMap[monthKey]++;
      
      if (b.status === 'completed' || b.verificationStatus === 'completed') completedCount++;
      if (b.status === 'cancelled') cancelledCount++;
    });
    
    const dailyBookings = Object.keys(dailyBookingsMap).map(date => ({ date, count: dailyBookingsMap[date] }));
    const monthlyBookings = Object.keys(monthlyBookingsMap).map(month => ({ month, count: monthlyBookingsMap[month] }));

    const supportStatusMap = { 'Open': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 };
    supportRequests.forEach(s => {
      if (supportStatusMap[s.status] !== undefined) supportStatusMap[s.status]++;
      else supportStatusMap[s.status] = 1;
    });
    const supportStatus = Object.keys(supportStatusMap).map(status => ({ status, count: supportStatusMap[status] }));

    const parkingUsageMap = { 'two_wheeler': 0, 'four_wheeler': 0, 'bus': 0 };
    bookings.forEach(b => {
      if (b.vehicleType && parkingUsageMap[b.vehicleType] !== undefined) {
        parkingUsageMap[b.vehicleType]++;
      }
    });
    const parkingUsage = Object.keys(parkingUsageMap).map(type => ({ type, count: parkingUsageMap[type] }));

    // Queue distribution logic
    const queueStatus = {
      pending: bookings.filter(b => b.verificationStatus === 'none' || !b.verificationStatus).length,
      inQueue: bookings.filter(b => b.verificationStatus === 'in_queue').length,
      completed: completedCount,
    };

    // Summary logic
    const totalBookings = bookings.length;
    const completedDarshans = completedCount;
    const totalVIPs = vipRequests.length;
    const totalSupport = supportRequests.length;
    const resolvedSupport = supportRequests.filter(s => s.status === 'Resolved' || s.status === 'Closed').length;

    res.json({
      summary: {
        totalBookings,
        completedDarshans,
        totalVIPs,
        totalSupport,
        resolvedSupport,
        queueStatus,
      },
      charts: {
        dailyBookings,
        monthlyBookings,
        vipVsRegular: { regular: totalBookings, vip: totalVIPs },
        darshanCompletion: { completed: completedCount, cancelled: cancelledCount, pending: totalBookings - completedCount - cancelledCount },
        supportStatus,
        parkingUsage
      },
      bookings,
      vipRequests,
      supportRequests
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ message: 'Server error generating report data' });
  }
});

module.exports = router;
