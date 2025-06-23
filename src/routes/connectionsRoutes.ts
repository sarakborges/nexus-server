import { Router } from 'express';
import {
  createConnection,
  acceptConnection,
  deleteConnection,
} from '../controllers/connectionsController.ts';

const router = Router();

router.post('/', createConnection);
router.patch('/:id', acceptConnection);
router.delete('/:id', deleteConnection);

export default router;
