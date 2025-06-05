import { Router } from 'express';
import { getFeedByProfile } from '../controllers/feedController.ts';

const router = Router();

router.get('/:id', getFeedByProfile);

export default router;
