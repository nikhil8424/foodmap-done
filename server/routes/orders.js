import express from 'express';
import { Order } from '../models/Order.js';
import { Food } from '../models/Food.js';
import { Vendor } from '../models/Vendor.js';
import { User } from '../models/User.js';

export default function orderRoutes(io) {
  const router = express.Router();

  // GET /api/orders - Fetch orders filtered by user, vendor, or status
  router.get('/', async (req, res) => {
    try {
      const { residentPhone, residentId, vendorId, status } = req.query;
      const query = {};

      if (residentPhone) query.residentPhone = new RegExp(residentPhone.slice(-10), 'i');
      if (residentId) query.residentId = residentId;
      if (vendorId) query.vendorId = vendorId;
      if (status) query.status = status;

      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
      console.error('Fetch orders error:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // GET /api/orders/:id - Single order details
  router.get('/:id', async (req, res) => {
    try {
      let order = await Order.findById(req.params.id);
      if (!order) {
        order = await Order.findOne({ orderNumber: req.params.id });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json({ success: true, order });
    } catch (err) {
      console.error('Fetch single order error:', err);
      return res.status(500).json({ error: 'Failed to fetch order details' });
    }
  });

  // POST /api/orders - Create a new order with MANDATORY ATOMIC INVENTORY DEDUCTION
  router.post('/', async (req, res) => {
    try {
      const {
        foodId,
        quantity = 1,
        residentName = 'Resident',
        residentPhone = '9876543210',
        specialInstructions = '',
        residentLocation
      } = req.body;

      if (!foodId) {
        return res.status(400).json({ error: 'Food item ID is required' });
      }

      const reqQty = parseInt(quantity, 10);
      if (isNaN(reqQty) || reqQty <= 0) {
        return res.status(400).json({ error: 'Invalid order portion quantity' });
      }

      // CRITICAL: Atomic MongoDB decrement to protect against simultaneous orders & overselling
      const updatedFood = await Food.findOneAndUpdate(
        {
          _id: foodId,
          quantity: { $gte: reqQty },
          isAvailable: true
        },
        {
          $inc: { quantity: -reqQty }
        },
        { new: true }
      );

      if (!updatedFood) {
        // Insufficient portions available or simultaneous order captured remaining portions!
        const currentFoodState = await Food.findById(foodId);
        const availableNow = currentFoodState ? currentFoodState.quantity : 0;
        return res.status(409).json({
          error: availableNow > 0
            ? `Only ${availableNow} portion(s) left. Please reduce quantity.`
            : 'Sorry, this dish was just sold out!'
        });
      }

      // Update availability and status if inventory reaches 0
      if (updatedFood.quantity <= 0) {
        updatedFood.isAvailable = false;
        updatedFood.status = 'sold_out';
        await updatedFood.save();
      }

      // Fetch vendor details
      const vendor = await Vendor.findById(updatedFood.vendorId);

      // Create and persist order in MongoDB
      const totalAmount = updatedFood.price * reqQty;
      const order = await Order.create({
        orderNumber: `FM-${Math.floor(1000 + Math.random() * 9000)}`,
        residentName,
        residentPhone,
        vendorId: updatedFood.vendorId,
        vendorName: updatedFood.vendorName,
        vendorPhone: vendor ? vendor.phone : '+91 98201 45892',
        foodId: updatedFood._id,
        foodName: updatedFood.name,
        foodImage: updatedFood.image,
        quantity: reqQty,
        pricePerUnit: updatedFood.price,
        totalAmount,
        status: 'placed',
        specialInstructions,
        pickupAddress: vendor ? vendor.address : 'Building B, Flat 402, Bhandup West, Mumbai',
        pickupLocation: vendor ? vendor.location : updatedFood.location,
        residentLocation: residentLocation || { type: 'Point', coordinates: [72.9350, 19.1465] },
        statusHistory: [
          { status: 'placed', timestamp: new Date(), note: 'Order placed by resident' }
        ]
      });

      // ONLY emit real-time events after database operations succeed
      // 1. Broadcast food inventory reduction to all users viewing FoodRadar / FoodDetails
      io.emit('food:availabilityUpdated', {
        foodId: updatedFood._id,
        quantity: updatedFood.quantity,
        isAvailable: updatedFood.isAvailable,
        status: updatedFood.status,
        name: updatedFood.name,
        price: updatedFood.price
      });

      // 2. Broadcast incoming order to vendor and connected dashboard
      io.emit('order:newIncoming', order);

      return res.status(201).json({
        success: true,
        order,
        food: updatedFood,
        message: 'Order placed successfully!'
      });
    } catch (err) {
      console.error('Create order error:', err);
      return res.status(500).json({ error: 'Failed to place order' });
    }
  });

  // PUT /api/orders/:id/status - Update order status along lifecycle
  router.put('/:id/status', async (req, res) => {
    try {
      const { status, note = '' } = req.body;
      const validStatuses = ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      let order = await Order.findById(req.params.id);
      if (!order) {
        order = await Order.findOne({ orderNumber: req.params.id });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const previousStatus = order.status;
      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated from ${previousStatus} to ${status}`
      });

      await order.save();

      // If order is cancelled, atomically restore inventory back to Food
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        const restoredFood = await Food.findByIdAndUpdate(
          order.foodId,
          {
            $inc: { quantity: order.quantity },
            isAvailable: true,
            status: 'ready'
          },
          { new: true }
        );

        if (restoredFood) {
          io.emit('food:availabilityUpdated', {
            foodId: restoredFood._id,
            quantity: restoredFood.quantity,
            isAvailable: restoredFood.isAvailable,
            status: restoredFood.status
          });
        }
      }

      // ONLY emit real-time event after database persistence succeeds
      io.emit('order:statusChanged', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        order
      });

      return res.json({ success: true, order, message: `Order status updated to ${status}` });
    } catch (err) {
      console.error('Update order status error:', err);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  return router;
}
