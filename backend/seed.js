require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Queue = require('./models/Queue');
const VIPRequest = require('./models/VIPRequest');
const SystemSettings = require('./models/SystemSettings');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-darshan';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected. Seeding data...');

    // Clear existing
    await Booking.deleteMany({});
    await Queue.deleteMany({});
    await VIPRequest.deleteMany({});
    await SystemSettings.deleteMany({});

    console.log('Old data cleared.');

    // Seed Settings
    const settings = new SystemSettings({
      visitorLimit: 50000,
      isEmergencyActive: false,
      parkingCapacity: 1000,
      parkingOccupancy: 65,
    });
    await settings.save();

    // Seed Bookings
    const b1 = new Booking({
      fullName: 'Amit Sharma',
      mobile: '9876543210',
      placeCity: 'Mumbai',
      persons: 2,
      darshanDate: new Date(),
      status: 'confirmed',
    });
    const b2 = new Booking({
      fullName: 'Vikas Bansal',
      mobile: '8765432109',
      placeCity: 'Delhi',
      persons: 4,
      darshanDate: new Date(),
      status: 'confirmed',
    });
    const b3 = new Booking({
      fullName: 'Reema Malhotra',
      mobile: '7654321098',
      placeCity: 'Pune',
      persons: 1,
      darshanDate: new Date(),
      status: 'confirmed',
    });
    await Promise.all([b1.save(), b2.save(), b3.save()]);

    // Seed Queue
    const q1 = new Queue({
      bookingId: b1._id,
      tokenNumber: 'A001',
      checkInTime: new Date(Date.now() - 30 * 60000), // 30 mins ago
      status: 'serving',
    });
    const q2 = new Queue({
      bookingId: b2._id,
      tokenNumber: 'A002',
      isVip: true,
      checkInTime: new Date(Date.now() - 15 * 60000),
      status: 'waiting',
    });
    const q3 = new Queue({
      bookingId: b3._id,
      tokenNumber: 'A003',
      checkInTime: new Date(Date.now() - 5 * 60000),
      status: 'waiting',
    });
    await Promise.all([q1.save(), q2.save(), q3.save()]);

    // Seed VIP Requests
    const v1 = new VIPRequest({
      name: 'Ramesh Singh',
      category: 'Government Official',
      status: 'pending',
    });
    const v2 = new VIPRequest({
      name: 'Priya Kapoor',
      category: 'Celebrity',
      status: 'approved',
    });
    await Promise.all([v1.save(), v2.save()]);

    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
