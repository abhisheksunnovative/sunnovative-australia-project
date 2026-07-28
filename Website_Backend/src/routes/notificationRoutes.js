import express from 'express';
import { getAdminNotifications, getEpcNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router = express.Router();

router.get('/admin', getAdminNotifications);
router.get('/epc', protectEpc, getEpcNotifications);
router.put('/:id/read', markNotificationRead);

export default router;
