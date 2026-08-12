import express from 'express';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getKwPackages,
  createKwPackage,
  updateKwPackage,
  deleteKwPackage,
  getInstallerConfigs,
  createInstallerConfig,
  updateInstallerConfig,
  deleteInstallerConfig
} from '../controllers/epcSubscriptionSettingsController.js';

const router = express.Router();

// Plans
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// KW Packages
router.get('/packages', getKwPackages);
router.post('/packages', createKwPackage);
router.put('/packages/:id', updateKwPackage);
router.delete('/packages/:id', deleteKwPackage);

// Installer Configs
router.get('/installer-configs', getInstallerConfigs);
router.post('/installer-configs', createInstallerConfig);
router.put('/installer-configs/:id', updateInstallerConfig);
router.delete('/installer-configs/:id', deleteInstallerConfig);

export default router;
