import express from 'express';
import { trackEvent, getDashboardMetrics } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/track', trackEvent);
router.get('/metrics', getDashboardMetrics);

export default router;
