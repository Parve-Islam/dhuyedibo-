import mongoose, { Schema, models, model } from 'mongoose';

// Schema for appointments
const appointmentSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  laundryShopId: { 
    type: Schema.Types.ObjectId, 
    ref: 'LaundryShop',
    required: true
  },
  date: { 
    type: Date,
    required: true
  },
  timeSlot: { 
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled'], 
    default: 'Scheduled' 
  }
}, { 
  timestamps: true 
});

const Appointment = models.Appointment || model('Appointment', appointmentSchema);
export default Appointment;