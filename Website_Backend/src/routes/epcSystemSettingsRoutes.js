import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/epcSystemSettingsController.js';

const router = express.Router();

router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);

export default router;
