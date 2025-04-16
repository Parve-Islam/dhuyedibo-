// models/Order.ts
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  laundryShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'LaundryShop' },
  services: [
    {
      serviceId: String,
      name: String,
      price: Number
    }
  ],
  totalPrice: Number,
  promoCode: String,
  discount: Number,
  status: {
    type: String,
    enum: ['Pending Pickup', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending Pickup'
  },
  pickupConfirmed: { type: Boolean, default: false },
  deliveryConfirmed: { type: Boolean, default: false },
  history: [
    {
      status: String,
      timestamp: Date
    }
  ]
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
