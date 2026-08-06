import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  role: { type: String, enum: ['Admin', 'EpcPartner', 'BDE', 'Customer'], required: true },
  recipientId: { type: mongoose.Schema.Types.Mixed, default: null }, // Null if role is Admin
  title: { type: String, required: true },
  message: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectOrder', default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
