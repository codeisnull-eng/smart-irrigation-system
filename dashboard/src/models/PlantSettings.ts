import mongoose from 'mongoose';

const PlantSettingsSchema = new mongoose.Schema({
  plantName: { type: String, required: true },
  minMoisture: { type: Number, required: true },
  maxMoisture: { type: Number, required: true },
  minTemperature: { type: Number, required: true },
  maxTemperature: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.PlantSettings ||
  mongoose.model('PlantSettings', PlantSettingsSchema);