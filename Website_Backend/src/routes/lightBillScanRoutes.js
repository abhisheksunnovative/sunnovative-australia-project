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
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only image (JPG/PNG), PDF, or text files are allowed'));
    }
  },
});

router.post('/scan', upload.single('billFile'), scanLightBill);

// Task 2 — matches OCR-extracted data against CustomerEligibilityScreen settings
router.post('/check-eligibility', checkBillEligibility);

// Task 3 — Fetch scanned bills history
router.get('/history', async (req, res) => {
  try {
    const { BillExtraction } = await import('../models/BillExtraction.js');
    const bills = await BillExtraction.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, bills });
  } catch (err) {
    console.error('Failed to fetch bill history:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;