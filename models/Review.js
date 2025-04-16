// models/Review.ts
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  laundryShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'LaundryShop' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
