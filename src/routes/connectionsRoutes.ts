import { Router } from 'express';
import {
  createConnection,
  acceptConnection,
  deleteConnection,
} from '../controllers/connectionsController.ts';

const router = Router();

router.post('/create', createConnection);
router.patch('/accept', acceptConnection);
router.delete('/delete', deleteConnection);

export default router;
