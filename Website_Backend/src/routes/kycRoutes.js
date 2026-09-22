import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { protectEpc } from '../middleware/epcAuthMiddleware.js';
import {
  getKycRequirements,
  createKycRequirement,
  deleteKycRequirement,
  getEpcKycList,
  updateEpcKycStatus,
  uploadEpcKycDocument
} from '../controllers/kycController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'uploads/kyc/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, kyc-);
  },
});
const upload = multer({ storage });

// Admin routes
router.get('/requirements', protectAdmin, getKycRequirements);
router.post('/requirements', protectAdmin, createKycRequirement);
router.delete('/requirements/:id', protectAdmin, deleteKycRequirement);

router.get('/epcs', protectAdmin, getEpcKycList);
router.put('/epcs/:id/status', protectAdmin, updateEpcKycStatus);

// EPC routes
router.post('/upload', protectEpc, upload.single('document'), uploadEpcKycDocument);

export default router;
