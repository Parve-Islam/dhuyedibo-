// models/LaundryMenu.js
import mongoose from 'mongoose';

const LaundryMenuSchema = new mongoose.Schema({
  clothType: { type: String, required: true },
  serviceType: { type: String, required: true },
  price: { type: Number, required: true },
  shopId: { type: Number, required: true },
  serviceId: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.LaundryMenu || mongoose.model("LaundryMenu", LaundryMenuSchema);