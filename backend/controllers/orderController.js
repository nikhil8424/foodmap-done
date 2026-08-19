import * as orderService from '../services/orderService.js';
import * as foodService from '../services/foodService.js';

export async function createOrder(req, res, next) {
  try {
    const { vendorId, items, orderType, specialInstructions } = req.body;
    const order = await orderService.createOrder(req.user._id, {
      vendorId,
      items,
      orderType,
      specialInstructions,
    });

    // Real-time notifications via Socket.IO
    if (req.io) {
      // 1. Notify vendor of new order
      req.io.to(`vendor:${order.vendor._id}`).emit('order:created', order);
      req.io.emit('order:created', order); // Broadcast to any active dashboard

      // 2. Broadcast updated food quantity to all connected users
      for (const item of items) {
        const updatedFood = await foodService.getFoodById(item.foodId);
        if (updatedFood) {
          req.io.emit('food:availabilityUpdated', {
            foodId: updatedFood._id,
            quantity: updatedFood.quantity,
            available: updatedFood.available,
            status: updatedFood.status,
          });

          if (updatedFood.quantity === 0 || !updatedFood.available) {
            req.io.emit('food:soldOut', { foodId: updatedFood._id });
          }
        }
      }
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    if (err.message.includes('Insufficient quantity')) {
      return res.status(409).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, rejectionReason, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, {
      status,
      rejectionReason,
      note,
    });

    if (req.io) {
      req.io.to(`order:${order._id}`).emit('order:statusUpdated', order);
      req.io.to(`user:${order.resident._id || order.resident}`).emit('order:statusUpdated', order);
      req.io.emit('order:statusUpdated', order);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await orderService.getOrders(req.query);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}
