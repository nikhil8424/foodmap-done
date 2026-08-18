import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'foodmap_super_secret_jwt_key_2025';

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    // In production, an SMS gateway (Twilio / Firebase Auth) would send an SMS.
    // For this full-stack environment, we accept OTP verification directly.
    return res.json({
      success: true,
      message: `OTP sent to +91 ${cleanPhone}`,
      phone: cleanPhone,
      demoOtp: '102400'
    });
  } catch (err) {
    console.error('Auth request-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP & Login/Register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, role = 'resident', name } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      user = await User.create({
        phone: cleanPhone,
        name: name || (cleanPhone === '9876543210' ? 'Nikhil Gupta' : (cleanPhone === '9820145892' ? 'Anjali Sharma' : 'Neighbor')),
        role: role || 'resident',
        address: 'Bhandup West, Mumbai',
        location: {
          type: 'Point',
          coordinates: [72.9342 + (Math.random() - 0.5) * 0.005, 19.1458 + (Math.random() - 0.5) * 0.005]
        }
      });
    }

    // Check if user has an associated vendor profile
    let vendor = await Vendor.findOne({ userId: user._id });
    if (!vendor && (user.role === 'vendor' || user.role === 'both' || role === 'vendor')) {
      // Create vendor profile if requested
      vendor = await Vendor.create({
        userId: user._id,
        kitchenName: `${user.name}'s Kitchen`,
        ownerName: user.name,
        phone: `+91 ${cleanPhone}`,
        address: user.address,
        location: user.location,
        bio: 'Passionate home cook serving homemade meals with fresh ingredients.'
      });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user,
      vendor
    });
  } catch (err) {
    console.error('Auth verify-otp error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fallback: check query or return default user
      const defaultUser = await User.findOne().sort({ createdAt: 1 });
      const defaultVendor = defaultUser ? await Vendor.findOne({ userId: defaultUser._id }) : null;
      return res.json({ user: defaultUser, vendor: defaultVendor });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const vendor = await Vendor.findOne({ userId: user._id });
    return res.json({ user, vendor });
  } catch (err) {
    console.error('Auth me error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Update role / profile
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, role, address, location } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;
    if (address) updates.address = address;
    if (location && location.coordinates) updates.location = location;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    let vendor = await Vendor.findOne({ userId: user._id });

    if (!vendor && (role === 'vendor' || role === 'both')) {
      vendor = await Vendor.create({
        userId: user._id,
        kitchenName: `${user.name}'s Kitchen`,
        ownerName: user.name,
        phone: `+91 ${user.phone}`,
        address: user.address,
        location: user.location
      });
    }

    return res.json({ success: true, user, vendor });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
