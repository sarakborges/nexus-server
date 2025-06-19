import { Router } from 'express';
import {
  getFeedByProfile,
  createNewFeedItem,
} from '../controllers/feedController.ts';

const router = Router();

router.post('/', createNewFeedItem);
router.get('/:id', getFeedByProfile);

export default router;
