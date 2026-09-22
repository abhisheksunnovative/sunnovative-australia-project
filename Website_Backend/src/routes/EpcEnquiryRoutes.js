import express from 'express';
import { getMyEnquiries, getEnquiryById, acceptEnquiry, rejectEnquiry, convertToOrder, confirmInstallDate } from '../controllers/epcEnquiryController.js';
import { protectEpc } from '../middleware/protectEpc.js';
import upload from '../middleware/multer.js';

const router  = express.Router();

router.get ('/',                  protectEpc, getMyEnquiries);
router.get ('/:id',               protectEpc, getEnquiryById);
router.put ('/:id/accept',        protectEpc, acceptEnquiry);
router.put ('/:id/reject',        protectEpc, rejectEnquiry);
router.put ('/:id/confirm-date',  protectEpc, upload.single('kycFile'), confirmInstallDate);
router.post('/:id/convert-order', protectEpc, convertToOrder);

export default router;
