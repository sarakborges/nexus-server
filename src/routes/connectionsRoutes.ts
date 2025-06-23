import { Router } from 'express';
import {
  createConnection,
  acceptConnection,
  deleteConnection,
} from '../controllers/connectionsController.ts';

const router = Router();

router.post('/', createConnection);
router.patch('/', acceptConnection);
router.delete('/', deleteConnection);

export default router;
