import express from 'express';
import {
  getCalendarSlots, addCalendarSlot, addBulkSlots,
  updateCalendarSlot, deleteCalendarSlot, getAvailableSlots,
} from '../controllers/epcCalendarController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router  = express.Router();

router.get('/available', getAvailableSlots);
router.get   ('/',      protectEpc, getCalendarSlots);
router.post  ('/',      protectEpc, addCalendarSlot);
router.post  ('/bulk',  protectEpc, addBulkSlots);
router.put   ('/:id',   protectEpc, updateCalendarSlot);
router.delete('/:id',   protectEpc, deleteCalendarSlot);

export default router;