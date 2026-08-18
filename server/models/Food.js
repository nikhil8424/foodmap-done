import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Main Course'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  initialQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['ready', 'preparing', 'sold_out'],
    default: 'ready'
  },
  cookingStatus: {
    type: String,
    default: 'Ready now'
  },
  image: {
    type: String,
    default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5tj44PBk_pXA_-WXZGHdA-t1aeLtsjItWwoODao564te6kYMnEP0nty7ZmOM1uGDAyCKeo4ZYgD29FWPxya4vFyDPBKuIYhfbZ2r_4nqxWX2NWHuZSb-U__HojUGlV7Qry_kdbWUTrcyLsEX02meeaz_G9Og5CwwN55pjxKG7NpNoYWSjq69eI9DSj9SGrl1IVowEZ0jKsCnvaymZkSjT65zjQQSkEjmH1Cu6jClqXYIOkburuor5'
  },
  diet: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    default: 'veg'
  },
  tags: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [72.9342, 19.1458]
    }
  }
}, {
  timestamps: true
});

foodSchema.index({ location: '2dsphere' });
foodSchema.index({ vendorId: 1, isAvailable: 1 });

export const Food = mongoose.model('Food', foodSchema);
