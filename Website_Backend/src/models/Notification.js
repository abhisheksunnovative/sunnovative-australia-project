import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  role: { type: String, enum: ['Admin', 'EpcPartner'], required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', default: null }, // Null if role is Admin
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
