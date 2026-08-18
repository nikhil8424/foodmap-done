import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  kitchenName: {
    type: String,
    required: true,
    trim: true
  },
  vendorType: {
    type: String,
    enum: ['home', 'street', 'tiffin'],
    default: 'home'
  },
  ownerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: 'Bhandup West, Mumbai'
  },
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
  },
  bio: {
    type: String,
    default: 'Passionate neighborhood home cook serving fresh, homestyle specialties.'
  },
  experience: {
    type: String,
    default: 'Cooking for 4+ years'
  },
  rating: {
    type: Number,
    default: 4.9
  },
  reviewCount: {
    type: Number,
    default: 24
  },
  avatar: {
    type: String,
    default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUAKf21eybPUtwjXWS_WDPcM3KS176CUGgvq9K8tOR9nvREtDOtAIH3wvA0YQv6cNKpWqL-hDv_hxicHTJfpg3fJYeC-MBr5DDGUd5zeF3PPagp74DJ9-sxSew09ougUUFCmU7P-4Ce8i6LS6HlJCLLYB6TIxWUGpNIgv0PVtUx0vGt7CulFXqjZj3JdVIwzjRPc0QLiMAATn7yplewZF9vCw2IEg7qXhsjKuXymuCd9q6sdRqsf91'
  },
  coverImage: {
    type: String,
    default: 'https://lh3.googleusercontent.com/aida/AP1WRLuDc9bH-IA06P2L6_W9Q5aP_zcaHr2Gr4AXjE7Y0mB862tCkeRCYN5TMn-2hXCZ8XGRJoFkIlXV2K-34snxDNuh5ovfaL3cXQcCk7mD8sxnEolrnZDzyli7ub0Xfw4Wl2GKdIrC-UmLrLN-6dDs-Tj-wfqKn9Z906nuXRDDesZSGnk9Cw3RykuAEVJ_T8Rnh-zxLeyb-7wsQ_29vRY14YlxDViP6YaQnUuxSzT4xjDVM0gsPpR1gIEyCjo'
  },
  specialties: [{
    type: String
  }],
  isOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

vendorSchema.index({ location: '2dsphere' });

export const Vendor = mongoose.model('Vendor', vendorSchema);
