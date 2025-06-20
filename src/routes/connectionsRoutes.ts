import { Router } from 'express';
import {
  createConnection,
  acceptConnection,
  deleteConnection,
} from '../controllers/connectionsController.ts';

const router = Router();

router.post('/create', createConnection);
router.post('/accept', acceptConnection);
router.post('/delete', deleteConnection);

export default router;
