import express from 'express';
import {
  getOrderSummary,
  getDemandStats,
  getMyOrders,
  getOrderById,
  updateOrderStage,
  uploadRegistrationDocs,
  uploadInstallationDocs,
  uploadPcr,
  fixInstallDate,
  checkOverdueOrders,
  getDemandSupplyAnalytics
} from '../controllers/epcOrderController.js';
import { protectEpc, requireVerified } from '../middleware/protectEpc.js';
import upload from '../middleware/multer.js';

const router  = express.Router();

router.get('/summary', protectEpc, getOrderSummary);
router.get('/demand-stats', protectEpc, getDemandStats);
router.get('/demand-analytics', protectEpc, getDemandSupplyAnalytics);
router.get('/',        protectEpc, getMyOrders);
router.get('/:id',     protectEpc, getOrderById);
router.put('/:id/stage', protectEpc, updateOrderStage);

router.post(
  '/:id/upload-docs',
  protectEpc,
  requireVerified,
  upload.array('files', 10),
  uploadRegistrationDocs,
);

router.post('/:id/docs/installation', protectEpc, upload.fields([
  { name: 'photos',      maxCount: 10 },
  { name: 'netMetering', maxCount: 1  }
]), uploadInstallationDocs);

router.post('/:id/docs/pcr', protectEpc, upload.single('pcr'), uploadPcr);

router.put('/:id/fix-date', protectEpc, fixInstallDate);
router.post('/check-overdue', protectEpc, checkOverdueOrders); 

export default router;