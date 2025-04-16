// models/WeatherReport.js
import mongoose from 'mongoose';

const weatherReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  city: { type: String, required: true },
  temperature: { type: Number, required: true },
  weatherCondition: { type: String, enum: ['Clear', 'Cloudy', 'Rainy', 'Thunderstorm', 'Snow'], required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  recommendation: { 
    type: String,
    enum: ['Send Laundry', 'Hold Laundry'],
    default: 'Hold Laundry',
    description: 'A recommendation based on the weather condition (e.g., rainy weather = Hold Laundry)',
  },
}, { timestamps: true });

// Example logic for assigning recommendation
weatherReportSchema.pre('save', function (next) {
  if (this.weatherCondition === 'Rainy' || this.weatherCondition === 'Thunderstorm') {
    this.recommendation = 'Hold Laundry';
  } else {
    this.recommendation = 'Send Laundry';
  }
  next();
});

export default mongoose.models.WeatherReport || mongoose.model('WeatherReport', weatherReportSchema);
