import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  moisture: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.SensorData || 
  mongoose.model('SensorData', SensorDataSchema);
