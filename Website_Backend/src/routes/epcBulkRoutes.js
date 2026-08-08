import express from 'express';
import { 
  getSettings, 
  saveSettings, 
  getLeads, 
  uploadLeads, 
  getDashboardStats 
} from '../controllers/epcBulkController.js';
// We might not have a specific protectAdmin middleware, relying on general protections or creating one.
// Let's assume standard routes for now, we can add middleware if it exists.

const router = express.Router();

// Bulk Upload Settings
router.get('/settings', getSettings);
router.post('/settings', saveSettings);

// Bulk Leads Management
router.get('/leads', getLeads);
router.post('/upload', uploadLeads);
router.get('/stats', getDashboardStats);

export default router;
