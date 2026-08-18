import express from 'express';
import { Vendor } from '../models/Vendor.js';
import { Food } from '../models/Food.js';

export default function vendorRoutes(io) {
  const router = express.Router();

  // GET /api/vendors - List all active vendors with their dishes
  router.get('/', async (req, res) => {
    try {
      const { type, search, lng, lat, maxDistance = 5000 } = req.query;
      const query = { isOpen: true };

      if (type && type !== 'all') {
        query.vendorType = type;
      }

      if (search) {
        query.$or = [
          { kitchenName: new RegExp(search, 'i') },
          { ownerName: new RegExp(search, 'i') },
          { specialties: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      if (lng && lat) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(maxDistance, 10)
          }
        };
      }

      const vendors = await Vendor.find(query).sort({ rating: -1 });

      // Attach active live food items for each vendor
      const vendorsWithFoods = await Promise.all(
        vendors.map(async (v) => {
          const foods = await Food.find({ vendorId: v._id, isAvailable: true }).sort({ createdAt: -1 });
          return {
            ...v.toObject(),
            foods
          };
        })
      );

      return res.json({ success: true, count: vendorsWithFoods.length, vendors: vendorsWithFoods });
    } catch (err) {
      console.error('Fetch vendors error:', err);
      return res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  // GET /api/vendors/:id - Get specific vendor details & full menu
  router.get('/:id', async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      const foods = await Food.find({ vendorId: vendor._id }).sort({ isAvailable: -1, createdAt: -1 });
      return res.json({ success: true, vendor, foods });
    } catch (err) {
      console.error('Fetch single vendor error:', err);
      return res.status(500).json({ error: 'Failed to fetch vendor details' });
    }
  });

  // PUT /api/vendors/:id - Update vendor kitchen profile
  router.put('/:id', async (req, res) => {
    try {
      const { kitchenName, vendorType, address, bio, experience, specialties, isOpen, location } = req.body;
      const updates = {};

      if (kitchenName !== undefined) updates.kitchenName = kitchenName;
      if (vendorType !== undefined) updates.vendorType = vendorType;
      if (address !== undefined) updates.address = address;
      if (bio !== undefined) updates.bio = bio;
      if (experience !== undefined) updates.experience = experience;
      if (specialties !== undefined) updates.specialties = specialties;
      if (isOpen !== undefined) updates.isOpen = isOpen;
      if (location && location.coordinates) updates.location = location;

      const vendor = await Vendor.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      // If kitchen name changed, sync with foods
      if (kitchenName) {
        await Food.updateMany({ vendorId: vendor._id }, { vendorName: kitchenName });
      }

      io.emit('radar:vendorUpdated', vendor);

      return res.json({ success: true, vendor, message: 'Vendor profile updated successfully!' });
    } catch (err) {
      console.error('Update vendor error:', err);
      return res.status(500).json({ error: 'Failed to update vendor' });
    }
  });

  return router;
}
