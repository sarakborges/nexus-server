import { Router } from 'express';
import {
  createUserController,
  doLoginController,
  refreshTokenController,
} from '@/controllers/auth.controller.ts';

const router = Router();

router.post('/login', doLoginController);
router.post('/refresh', refreshTokenController);
router.post('/register', createUserController);

export default router;
