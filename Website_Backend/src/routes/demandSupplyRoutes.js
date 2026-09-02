import express from 'express';
import { getDemandSupplyAnalytics, updateGlobalSettings, updateRegionSettings, fixUnknownDistricts } from '../controllers/demandSupplyController.js';

const router = express.Router();

router.get('/', getDemandSupplyAnalytics);
router.get('/fix-districts', fixUnknownDistricts);
router.put('/global', updateGlobalSettings);
router.put('/region', updateRegionSettings);

export default router;
