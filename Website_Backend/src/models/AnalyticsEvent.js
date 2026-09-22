import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema({
  eventType: { type: String, required: true, enum: ['signup', 'login', 'visit', 'lead_created', 'order_created'] },
  userType: { type: String, enum: ['Customer', 'EPC', 'Admin', 'Visitor'], default: 'Visitor' },
  platform: { type: String, enum: ['Customer Web App', 'EPC Web App', 'Customer Website', 'EPC Website'] },
  deviceType: { type: String, enum: ['Desktop', 'Mobile', 'Tablet'], default: 'Desktop' },
  country: { type: String, default: 'unknown' },
  state: { type: String, default: 'unknown' },
  district: { type: String, default: 'unknown' },
  userId: { type: mongoose.Schema.Types.ObjectId, default: null } 
}, { timestamps: true });

export default mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
