import mongoose from 'mongoose';

const laundryShopSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: String,
  location: {
    address: String,
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: false } // Fixed this line
    }
  },
  menu: [
    {
      name: String,
      description: String,
      clothType: String,
      price: Number,
      category: { type: String, enum: ['Washing', 'Ironing', 'Dry Cleaning'] }
    }
  ],
  ratings: [Number],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

laundryShopSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.models.LaundryShop || mongoose.model('LaundryShop', laundryShopSchema);