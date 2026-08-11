import express from 'express';
import {
  getProductConfigs,
  createProductConfig,
  updateProductConfig,
  deleteProductConfig
} from '../controllers/productConfigController.js';

const router = express.Router();

router.get('/', getProductConfigs);
router.post('/', createProductConfig);
router.put('/:id', updateProductConfig);
router.delete('/:id', deleteProductConfig);

export default router;
