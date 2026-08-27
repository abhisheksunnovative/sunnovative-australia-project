import express from 'express';
import { fixPayments, fixDistricts, createLead, getAllLeads, getLeadById, updateLead, deleteLead, getLeadsByProject, assignLead, uploadLeads, upload, getAnalytics, getLeadStats, exportUnassignedLeads, convertLeadToProject, getLeadsHierarchy, requestDateOtp, verifyDateOtp, selectInstallDate, getEpcCalendarForLead } from '../controllers/leadController.js';

const router = express.Router();

router.get('/fix-districts', fixDistricts);
router.get('/fix-payments', fixPayments);

// Analytics + project + stats + export — specific routes BEFORE /:id
router.get('/hierarchy', getLeadsHierarchy);
router.get('/stats', getLeadStats);
router.get('/export-unassigned', exportUnassignedLeads);
router.get('/analytics', getAnalytics);
router.get('/project/:slug', getLeadsByProject);
router.post('/assign/:id', assignLead);
router.post('/:id/convert', convertLeadToProject);
router.post('/upload', upload.single('file'), uploadLeads);

// BDE Date OTP & Calendar Routes — must be BEFORE /:id to avoid route shadowing
router.get('/:id/epc-calendar', getEpcCalendarForLead);
router.post('/:id/request-date-otp', requestDateOtp);
router.post('/:id/verify-date-otp', verifyDateOtp);
router.post('/:id/select-install-date', selectInstallDate);

router.route('/').get(getAllLeads).post(createLead);
router.route('/:id').get(getLeadById).put(updateLead).delete(deleteLead);

export default router;
