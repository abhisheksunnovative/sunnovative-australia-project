import express from 'express';
import { 
  getAllPlans, 
  getMyPlan, 
  requestUpgrade, 
  verifyUpgrade,
  createInstallerUpgradeOrder,
  verifyInstallerUpgrade
} from '../controllers/epcPlanController.js';
import { protectEpc, requireVerified } from '../middleware/protectEpc.js';

const router = express.Router();

router.get('/', protectEpc, getAllPlans);
router.get('/my-plan', protectEpc, getMyPlan);
router.post('/upgrade', protectEpc, requestUpgrade);
router.post('/verify-upgrade', protectEpc, verifyUpgrade);

router.post('/upgrade-installer', protectEpc, createInstallerUpgradeOrder);
router.post('/verify-installer-upgrade', protectEpc, verifyInstallerUpgrade);

export default router;