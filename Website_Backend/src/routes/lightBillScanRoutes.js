import express from 'express';
import multer from 'multer';
import { scanLightBill } from '../controllers/lightBillScanController.js';
import { checkBillEligibility } from '../controllers/lightBillEligibilityController.js';
import { extractCountry } from '../middleware/countryMiddleware.js';

const router = express.Router();
router.use(extractCountry);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image (JPG/PNG) or PDF files are allowed'));
    }
  },
});

router.post('/scan', upload.single('billFile'), scanLightBill);

// Task 2 — matches OCR-extracted data against CustomerEligibilityScreen settings
router.post('/check-eligibility', checkBillEligibility);

export default router;