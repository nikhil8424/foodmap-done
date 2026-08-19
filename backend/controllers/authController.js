import * as authService from '../services/authService.js';
import User from '../models/User.js';

export async function requestOTP(req, res, next) {
  try {
    const { phone } = req.body;
    const result = await authService.requestOTP(phone);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function verifyOTP(req, res, next) {
  try {
    const { phone, otp, role, name } = req.body;
    const { user, token } = await authService.verifyOTP({ phone, otp, role, name });
    res.json({
      success: true,
      message: 'Verified successfully',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        location: user.location,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
}
