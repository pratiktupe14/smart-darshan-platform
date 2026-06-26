const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, mobileNumber, role } = req.body;
    
    if (!email || !password || !fullName || !mobileNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (user) {
      if (user.email === email) return res.status(400).json({ message: 'User with this email already exists' });
      if (user.mobileNumber === mobileNumber) return res.status(400).json({ message: 'User with this mobile number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      fullName,
      mobileNumber,
      role: role || 'user',
    });

    await user.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          _id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          profilePhoto: user.profilePhoto,
          placeCityVillage: user.placeCityVillage,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide both email/mobile and password' });
    }

    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier } : { mobileNumber: identifier };

    let user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          _id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          profilePhoto: user.profilePhoto,
          placeCityVillage: user.placeCityVillage,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mobile Login / Registration
router.post('/mobile-login', async (req, res) => {
  try {
    const { mobileNumber, role } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    // Find if user exists with this mobile number
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      // Create a new user with a mock email and password
      const email = `mobile_${mobileNumber}@smartdarshan.com`;
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(mobileNumber, salt); // use mobileNumber as temp password
      
      user = new User({
        email,
        password,
        fullName: `Devotee ${mobileNumber.slice(-4)}`,
        mobileNumber,
        role: role || 'user',
      });
      await user.save();
      console.log(`[POST /mobile-login] Registered new user with mobile: ${mobileNumber}`);
    } else {
      console.log(`[POST /mobile-login] Found existing user with mobile: ${mobileNumber}`);
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          _id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          profilePhoto: user.profilePhoto,
          placeCityVillage: user.placeCityVillage,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt
        }
      });
    });
  } catch (err) {
    console.error('[POST /mobile-login] Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get logged in user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('[GET /me] No token provided in authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[GET /me] Decoded JWT User ID:', decoded.user.id);
    
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      console.log('[GET /me] User not found for ID:', decoded.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('[GET /me] Successfully fetched user:', user._id, 'Name:', user.fullName);
    res.json(user);
  } catch (err) {
    console.error('[GET /me] Error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Update logged in user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('[PUT /profile] No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[PUT /profile] User ID requesting update:', decoded.user.id);
    
    const { fullName, mobileNumber, profilePhoto, placeCityVillage, preferredLanguage } = req.body;
    console.log('[PUT /profile] Update payload:', { fullName, mobileNumber, placeCityVillage, preferredLanguage });

    const user = await User.findById(decoded.user.id);
    if (!user) {
      console.log('[PUT /profile] User not found for ID:', decoded.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (placeCityVillage !== undefined) user.placeCityVillage = placeCityVillage;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

    await user.save();
    console.log('[PUT /profile] Profile saved successfully to database');
    
    // Return the updated user (excluding password)
    const updatedUser = await User.findById(decoded.user.id).select('-password');
    console.log('[PUT /profile] Returning updated user:', updatedUser._id, 'Name:', updatedUser.fullName);
    res.json(updatedUser);
  } catch (err) {
    console.error('[PUT /profile] Error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
