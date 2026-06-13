import mongoose from 'mongoose';

const PlantSettingsSchema = new mongoose.Schema({
  plantName: { type: String, required: true },

  englishName: { type: String },
  arabicName: { type: String },
  scientificName: { type: String },

  minMoisture: { type: Number, required: true },
  maxMoisture: { type: Number, required: true },

  minTemperature: { type: Number, required: true },
  maxTemperature: { type: Number, required: true },

  minHumidity: { type: Number },
  maxHumidity: { type: Number },

  lightRequirement: { type: String },

  difficulty: { type: String },
  careLevel: { type: String },
  petWarning: { type: Boolean },
  description: { type: String },

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.PlantSettings ||
  mongoose.model('PlantSettings', PlantSettingsSchema);