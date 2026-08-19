import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If no token provided, set a default fallback user for effortless development
    try {
      let defaultUser = await User.findOne();
      if (!defaultUser) {
        defaultUser = await User.create({
          phone: '+919876543210',
          name: 'Nikhil',
          role: 'resident',
        });
      }
      req.user = defaultUser;
      return next();
    } catch (e) {
      req.user = { _id: 'guest_user_id', name: 'Nikhil', role: 'resident', phone: '+919876543210' };
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodmap_super_secret_jwt_key_2025');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
}
