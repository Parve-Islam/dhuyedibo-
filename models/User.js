// File: models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePicture: String,
  
  notifications: [
    {
      message: String,
      title: { type: String, default: 'Notification' }, // Added title field
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  deleted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },  // To track if the user is verified
  otp: String,  // OTP generated for verification
  otpExpiry: { type: Date },  // Expiration date for OTP
  resetToken: String, // Password reset token
  resetTokenExpiry: { type: Date }, // Expiration date for reset token
}, { timestamps: true });

// Helper method to properly handle user.notifications.id() in routes
userSchema.virtual('notificationById').get(function() {
  return (notificationId) => this.notifications.find(n => n._id.toString() === notificationId);
});

export default mongoose.models.User || mongoose.model('User', userSchema);