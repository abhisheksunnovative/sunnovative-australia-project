import os

schema_code = '''import mongoose from 'mongoose';

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
'''

controller_code = '''import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Customer from '../models/Customer.js';
import EpcPartner from '../models/EpcPartner.js';
import Lead from '../models/Lead.js';
import ProjectOrder from '../models/EpcOrder.js'; 

export const trackEvent = async (req, res) => {
  try {
    const newEvent = new AnalyticsEvent(req.body);
    await newEvent.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDashboardMetrics = async (req, res) => {
  try {
    const { userType, platform, device, country, state, district } = req.query;

    let matchQuery = {};
    if (userType && userType !== 'All') matchQuery.userType = userType;
    if (platform && platform !== 'All') matchQuery.platform = platform;
    if (device && device !== 'All') matchQuery.deviceType = device;
    if (country && country !== 'All') matchQuery.country = country;
    if (state && state !== 'All') matchQuery.state = state;
    if (district && district !== 'All') matchQuery.district = district;
    
    const signups = await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'signup' });
    const logins = await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'login' });
    const leads = await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'lead_created' });
    const orders = await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'order_created' });

    const devices = await AnalyticsEvent.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } }
    ]);

    const platforms = await AnalyticsEvent.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    const totalCustomers = await Customer.countDocuments();
    const totalEpcs = await EpcPartner.countDocuments();

    res.json({
      metrics: {
        totalUsers: totalCustomers + totalEpcs,
        customerUsers: totalCustomers,
        epcUsers: totalEpcs,
        loginCount: logins,
        customerSignups: await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'signup', userType: 'Customer' }),
        epcSignups: await AnalyticsEvent.countDocuments({ ...matchQuery, eventType: 'signup', userType: 'EPC' }),
        customerLeads: leads,
        projectOrders: orders
      },
      devices,
      platforms
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
'''

routes_code = '''import express from 'express';
import { trackEvent, getDashboardMetrics } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/track', trackEvent);
router.get('/metrics', getDashboardMetrics);

export default router;
'''

with open('Website_Backend/src/models/AnalyticsEvent.js', 'w', encoding='utf-8') as f:
    f.write(schema_code)
with open('Website_Backend/src/controllers/analyticsController.js', 'w', encoding='utf-8') as f:
    f.write(controller_code)
with open('Website_Backend/src/routes/analyticsRoutes.js', 'w', encoding='utf-8') as f:
    f.write(routes_code)

print("Analytics Backend Created")
