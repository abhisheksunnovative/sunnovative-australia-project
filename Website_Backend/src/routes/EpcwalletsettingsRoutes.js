import express from 'express';
import {
  getWalletSettings,
  updateWalletSettings,
} from '../controllers/epcWalletSettingsController.js';

const router = express.Router();

// Matches the same pattern as the other admin-settings routes in this codebase
// (websiteSettingsRoutes, eligibilitySettingRoutes) — no protectEpc here since
// this is the ADMIN panel calling it, not the EPC portal.
router.get('/', getWalletSettings);
router.put('/', updateWalletSettings);

export default router;