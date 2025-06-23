import { Router } from 'express';
import {
  getMe,
  changeUserActiveProfile,
} from '../controllers/userController.ts';

const router = Router();

router.get('/me', getMe);
router.patch('/activeProfile', changeUserActiveProfile);

export default router;
