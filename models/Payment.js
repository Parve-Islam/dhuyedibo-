// models/Payment.ts
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: Number,
  method: { type: String, enum: ['Bkash', 'Nagad', 'Card'] },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  confirmationId: String,
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
