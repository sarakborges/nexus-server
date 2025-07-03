import { Router } from 'express';
import {
  getFeedByProfileController,
  createFeedItemController,
  deleteFeedItemController,
} from '@/controllers/feed.controller.ts';

const router = Router();

router.post('/', createFeedItemController);
router.get('/', getFeedByProfileController);
router.delete('/:id', deleteFeedItemController);

export default router;
