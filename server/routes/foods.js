import express from 'express';
import { Food } from '../models/Food.js';
import { Vendor } from '../models/Vendor.js';

export default function foodRoutes(io) {
  const router = express.Router();

  // GET /api/foods - List all active food items with optional filters
  router.get('/', async (req, res) => {
    try {
      const { category, diet, search, vendorId, availableOnly = 'false', lng, lat, maxDistance = 5000 } = req.query;

      const query = {};

      if (availableOnly === 'true') {
        query.isAvailable = true;
        query.quantity = { $gt: 0 };
      }

      if (vendorId) {
        query.vendorId = vendorId;
      }

      if (category && category !== 'All') {
        query.category = new RegExp(category, 'i');
      }

      if (diet && diet !== 'all') {
        query.diet = diet;
      }

      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { vendorName: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Geospatial query if coordinates provided
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

      const foods = await Food.find(query).sort({ updatedAt: -1, createdAt: -1 });
      return res.json({ success: true, count: foods.length, foods });
    } catch (err) {
      console.error('Fetch foods error:', err);
      return res.status(500).json({ error: 'Failed to fetch food items' });
    }
  });

  // GET /api/foods/:id - Single food details with vendor information
  router.get('/:id', async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      const vendor = await Vendor.findById(food.vendorId);
      return res.json({ success: true, food, vendor });
    } catch (err) {
      console.error('Fetch single food error:', err);
      return res.status(500).json({ error: 'Failed to fetch food details' });
    }
  });

  // POST /api/foods - Vendor posts a new food item
  router.post('/', async (req, res) => {
    try {
      const {
        vendorId,
        vendorName,
        name,
        description,
        category = 'Main Course',
        price,
        quantity,
        cookingStatus = 'Ready now',
        image,
        diet = 'veg',
        tags = [],
        location
      } = req.body;

      if (!name || price === undefined || quantity === undefined) {
        return res.status(400).json({ error: 'Name, price, and portions count are required' });
      }

      let resolvedVendorId = vendorId;
      let resolvedVendorName = vendorName;
      let resolvedLocation = location;

      if (!resolvedVendorId) {
        const defaultVendor = await Vendor.findOne();
        if (defaultVendor) {
          resolvedVendorId = defaultVendor._id;
          resolvedVendorName = defaultVendor.kitchenName;
          resolvedLocation = defaultVendor.location;
        }
      } else {
        const vendor = await Vendor.findById(resolvedVendorId);
        if (vendor) {
          resolvedVendorName = vendor.kitchenName;
          if (!resolvedLocation) resolvedLocation = vendor.location;
        }
      }

      const newFood = await Food.create({
        vendorId: resolvedVendorId,
        vendorName: resolvedVendorName || "Anjali's Kitchen",
        name,
        description: description || '',
        category,
        price: Number(price),
        quantity: Number(quantity),
        initialQuantity: Number(quantity),
        isAvailable: Number(quantity) > 0,
        status: Number(quantity) > 0 ? 'ready' : 'sold_out',
        cookingStatus,
        image: image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5tj44PBk_pXA_-WXZGHdA-t1aeLtsjItWwoODao564te6kYMnEP0nty7ZmOM1uGDAyCKeo4ZYgD29FWPxya4vFyDPBKuIYhfbZ2r_4nqxWX2NWHuZSb-U__HojUGlV7Qry_kdbWUTrcyLsEX02meeaz_G9Og5CwwN55pjxKG7NpNoYWSjq69eI9DSj9SGrl1IVowEZ0jKsCnvaymZkSjT65zjQQSkEjmH1Cu6jClqXYIOkburuor5',
        diet,
        tags: Array.isArray(tags) ? tags : [],
        location: resolvedLocation || { type: 'Point', coordinates: [72.9342, 19.1458] }
      });

      // ONLY emit real-time event after database persistence succeeds
      io.emit('food:newPosted', newFood);
      io.emit('food:availabilityUpdated', {
        foodId: newFood._id,
        quantity: newFood.quantity,
        isAvailable: newFood.isAvailable,
        status: newFood.status,
        name: newFood.name,
        price: newFood.price
      });

      return res.status(201).json({ success: true, food: newFood });
    } catch (err) {
      console.error('Post food error:', err);
      return res.status(500).json({ error: 'Failed to post new food listing' });
    }
  });

  // PUT /api/foods/:id - Vendor updates food details / portions / status
  router.put('/:id', async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        price,
        quantity,
        cookingStatus,
        image,
        diet,
        tags,
        isAvailable
      } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;
      if (price !== undefined) updates.price = Number(price);
      if (cookingStatus !== undefined) updates.cookingStatus = cookingStatus;
      if (image !== undefined) updates.image = image;
      if (diet !== undefined) updates.diet = diet;
      if (tags !== undefined) updates.tags = tags;

      if (quantity !== undefined) {
        const qtyNum = Number(quantity);
        updates.quantity = Math.max(0, qtyNum);
        updates.isAvailable = qtyNum > 0;
        updates.status = qtyNum > 0 ? 'ready' : 'sold_out';
      } else if (isAvailable !== undefined) {
        updates.isAvailable = Boolean(isAvailable);
        if (!updates.isAvailable) updates.status = 'sold_out';
      }

      const updatedFood = await Food.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!updatedFood) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      // ONLY emit real-time event after database persistence succeeds
      io.emit('food:updated', updatedFood);
      io.emit('food:availabilityUpdated', {
        foodId: updatedFood._id,
        quantity: updatedFood.quantity,
        isAvailable: updatedFood.isAvailable,
        status: updatedFood.status,
        name: updatedFood.name,
        price: updatedFood.price
      });

      return res.json({ success: true, food: updatedFood });
    } catch (err) {
      console.error('Update food error:', err);
      return res.status(500).json({ error: 'Failed to update food listing' });
    }
  });

  // DELETE /api/foods/:id - Vendor deletes food listing
  router.delete('/:id', async (req, res) => {
    try {
      const deletedFood = await Food.findByIdAndDelete(req.params.id);
      if (!deletedFood) {
        return res.status(404).json({ error: 'Food item not found' });
      }

      io.emit('food:deleted', { foodId: req.params.id });
      return res.json({ success: true, message: 'Food item deleted successfully' });
    } catch (err) {
      console.error('Delete food error:', err);
      return res.status(500).json({ error: 'Failed to delete food item' });
    }
  });

  return router;
}
