import express from 'express';
import upload from '../middleware/multer.js';
import {
  getAllProjects,
  getProjectById,
  completeStep,
} from '../controllers/epcProjectController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router  = express.Router();

router.get ('/',                        protectEpc, getAllProjects);
router.get ('/:id',                     protectEpc, getProjectById);
router.post('/:id/complete-step',       protectEpc, upload.single('evidence'), completeStep);

export default router;