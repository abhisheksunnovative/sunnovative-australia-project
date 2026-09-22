import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  getQualifications,
  createQualification,
  updateQualification,
  deleteQualification
} from '../controllers/qualificationController.js';

const router = express.Router();

// Allow public fetch for EPC registration form
router.get('/', getQualifications);

router.post('/', protectAdmin, createQualification);
router.put('/:id', protectAdmin, updateQualification);
router.delete('/:id', protectAdmin, deleteQualification);

export default router;
