import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    default: 'Neighbor'
  },
  role: {
    type: String,
    enum: ['resident', 'vendor', 'both'],
    default: 'resident'
  },
  address: {
    type: String,
    default: 'Bhandup West, Mumbai'
  },
  avatar: {
    type: String,
    default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-X2N_MBx3jeZoXjVwqr2YHzWOXb-McFnW5_Tul40mZAa9NuirSD7OKBkkDU56xzennrxI3Xgv-sO-QsSTQzj2Bgea6r41SOJqbrH8gWm8zMup3uMuMaG28Z-fGLLlliOALyrH-YnA9TWnRinucPUDxqCgeWLoi3BEPWE8u7Fh4xXAmbxwgcOfwpER6x1vM3SR1jywAKX3fBJaC48BfJ_cwOyEuMuIbtahE2gMi3BEM_m8HL3TAKHU'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [72.9342, 19.1458] // Bhandup West coordinates
    }
  },
  vouchedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }]
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

export const User = mongoose.model('User', userSchema);
