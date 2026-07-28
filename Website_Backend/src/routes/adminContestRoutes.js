import express from 'express';
import { getAllContests, createContest, updateContest, deleteContest, distributeRewards } from '../controllers/adminContestController.js';

const router = express.Router();

router.get('/', getAllContests);
router.post('/', createContest);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);
router.post('/:id/distribute', distributeRewards);

export default router;
