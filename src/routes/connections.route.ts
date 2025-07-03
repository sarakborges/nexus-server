import { Router } from 'express';
import {
  createConnectionController,
  acceptConnectionController,
  deleteConnectionController,
} from '@/controllers/connections.controller.ts';

const router = Router();

router.post('/', createConnectionController);
router.patch('/:id', acceptConnectionController);
router.delete('/:id', deleteConnectionController);

export default router;
