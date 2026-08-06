import express from 'express';
import { 
  getAdminNotifications, 
  getEpcNotifications, 
  markNotificationRead,
  getBdeNotifications,
  deleteNotification,
  deleteMultipleNotifications,
  markMultipleRead
} from '../controllers/notificationController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router = express.Router();

router.get('/admin', getAdminNotifications);
router.get('/epc', protectEpc, getEpcNotifications);
router.get('/bde/:bdeId', getBdeNotifications);

router.post('/mark-all-read', markMultipleRead);
router.post('/delete-batch', deleteMultipleNotifications);

router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
