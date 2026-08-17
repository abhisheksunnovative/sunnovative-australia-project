import express from 'express';
import { getSystemSettings, updateSystemSettings, updateRegionRule } from '../controllers/epcSystemSettingsController.js';

const router = express.Router();

router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);
router.put('/region-rule', updateRegionRule);

export default router;
