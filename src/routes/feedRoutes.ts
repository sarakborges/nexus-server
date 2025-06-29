import { Router } from 'express';
import {
  getFeedByProfile,
  createNewFeedItem,
  deleteFeedItemById,
} from '../controllers/feedController.ts';

const router = Router();

router.post('/', createNewFeedItem);
router.get('/', getFeedByProfile);
router.delete('/:id', deleteFeedItemById);

export default router;
