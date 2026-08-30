import express from 'express';
import { getMyEnquiries, getEnquiryById, acceptEnquiry, rejectEnquiry, convertToOrder, confirmInstallDate } from '../controllers/epcEnquiryController.js';
import { protectEpc } from '../middleware/protectEpc.js';
import EpcEnquiry from '../models/EpcEnquiry.js';

const router  = express.Router();

router.post('/create-test', async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get ('/',                  protectEpc, getMyEnquiries);
router.get ('/:id',               protectEpc, getEnquiryById);
router.put ('/:id/accept',        protectEpc, acceptEnquiry);
router.put ('/:id/reject',        protectEpc, rejectEnquiry);
router.put ('/:id/confirm-date',  protectEpc, confirmInstallDate);
router.post('/:id/convert-order', protectEpc, convertToOrder);

export default router;