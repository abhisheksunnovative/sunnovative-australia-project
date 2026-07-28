import express from 'express';
import { getTeamMembers, addTeamMember, updateTeamMember, removeTeamMember } from '../controllers/epcTeamController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router  = express.Router();

router.get   ('/',    protectEpc, getTeamMembers);
router.post  ('/',    protectEpc, addTeamMember);
router.put   ('/:id', protectEpc, updateTeamMember);
router.delete('/:id', protectEpc, removeTeamMember);

export default router;