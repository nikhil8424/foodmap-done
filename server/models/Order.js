import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `FM-${Math.floor(1000 + Math.random() * 9000)}`
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  residentName: {
    type: String,
    required: true
  },
  residentPhone: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorPhone: {
    type: String,
    default: '+91 98201 45892'
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  foodImage: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'],
    default: 'placed'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  pickupAddress: {
    type: String,
    default: 'Building B, Flat 402, Bhandup West, Mumbai'
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [72.9342, 19.1458]
    }
  },
  residentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [72.9350, 19.1465]
    }
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ residentPhone: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
