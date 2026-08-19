import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Vendor from '../models/Vendor.js';
import { deductFoodQuantity } from './foodService.js';

export async function createOrder(userId, { vendorId, items, orderType, specialInstructions }) {
  let vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    vendor = await Vendor.findOne();
    if (!vendor) {
      throw new Error('Vendor not found');
    }
  }

  // Atomically deduct food quantities
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const food = await deductFoodQuantity(item.foodId, item.quantity);
    const itemTotal = food.price * item.quantity;
    subtotal += itemTotal;
    orderItems.push({
      food: food._id,
      name: food.name,
      price: food.price,
      quantity: item.quantity,
      totalPrice: itemTotal,
    });
  }

  const deliveryFee = orderType === 'DELIVERY' ? 30 : 0;
  const platformFee = 5;
  const totalAmount = subtotal + deliveryFee + platformFee;
  const orderNumber = `#FM${Math.floor(1000 + Math.random() * 9000)}`;

  const order = await Order.create({
    orderNumber,
    resident: userId,
    vendor: vendor._id,
    items: orderItems,
    itemSummary: orderItems.map((i) => `${i.quantity}x ${i.name}`).join(', '),
    subtotal,
    deliveryFee,
    platformFee,
    totalAmount,
    status: 'PENDING',
    orderType: orderType || 'PICKUP',
    pickupAddress: vendor.pickupAddress,
    specialInstructions,
    timeline: [
      {
        status: 'PENDING',
        note: 'Order placed by resident',
      },
    ],
  });

  return await Order.findById(order._id).populate('vendor').populate('resident', 'name phone');
}

export async function updateOrderStatus(orderId, { status, rejectionReason, note }) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  if (rejectionReason) order.rejectionReason = rejectionReason;
  
  order.timeline.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
  });

  await order.save();
  return await Order.findById(orderId).populate('vendor').populate('resident', 'name phone');
}

export async function getOrders(filters = {}) {
  const query = {};
  if (filters.resident) query.resident = filters.resident;
  if (filters.vendor) query.vendor = filters.vendor;
  if (filters.status) query.status = filters.status;

  return await Order.find(query)
    .populate('vendor', 'businessName category pickupAddress location')
    .populate('resident', 'name phone')
    .sort({ createdAt: -1 });
}

export async function getOrderById(id) {
  return await Order.findById(id).populate('vendor').populate('resident', 'name phone');
}
