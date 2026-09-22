import express from 'express';
import { getDemandSupplyAnalytics, updateGlobalSettings, updateRegionSettings } from '../controllers/demandSupplyController.js';

const router = express.Router();

router.get('/analytics', getDemandSupplyAnalytics);
router.put('/settings/global', updateGlobalSettings);
router.put('/settings/region', updateRegionSettings);

export default router;
