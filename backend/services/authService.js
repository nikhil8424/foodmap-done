import User from '../models/User.js';
import Resident from '../models/Resident.js';
import Vendor from '../models/Vendor.js';
import { generateOTP } from '../utils/otpGenerator.js';
import { generateToken } from '../utils/generateToken.js';

export async function requestOTP(phone) {
  const otp = generateOTP();
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      phone,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });
  } else {
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
  }
  return { phone, otp, message: 'OTP sent successfully (Demo OTP: 1234)' };
}

export async function verifyOTP({ phone, otp, role, name }) {
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      phone,
      name: name || 'FoodMap User',
      role: role || 'resident',
      isVerified: true,
    });
  } else {
    if (role) user.role = role;
    if (name) user.name = name;
    user.isVerified = true;
    await user.save();
  }

  // Ensure role profile exists
  if (user.role === 'vendor') {
    let vendor = await Vendor.findOne({ user: user._id });
    if (!vendor) {
      vendor = await Vendor.create({
        user: user._id,
        businessName: `${user.name}'s Kitchen`,
      });
    }
  } else {
    let resident = await Resident.findOne({ user: user._id });
    if (!resident) {
      resident = await Resident.create({
        user: user._id,
      });
    }
  }

  const token = generateToken(user);
  return { user, token };
}
