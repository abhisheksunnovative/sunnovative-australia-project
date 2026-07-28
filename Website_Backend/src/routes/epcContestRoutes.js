import express from 'express';
import { getMyContests } from '../controllers/epcContestController.js';
import { protectEpc } from '../middleware/protectEpc.js';

const router = express.Router();

router.get('/my-contests', protectEpc, getMyContests);

export default router;
