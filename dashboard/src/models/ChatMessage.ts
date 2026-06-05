import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);