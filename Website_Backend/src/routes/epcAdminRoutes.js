import express from 'express';
import { getAllEpcs, updateKycStatus, toggleEpcStatus, addWarning, updateTrustBadgeStatus } from '../controllers/epcAdminController.js';

const router = express.Router();

router.get('/', getAllEpcs);
router.put('/:id/kyc', updateKycStatus);
router.put('/:id/status', toggleEpcStatus);
router.post('/:id/warning', addWarning);
router.put('/:id/trust-badge', updateTrustBadgeStatus);

export default router;
