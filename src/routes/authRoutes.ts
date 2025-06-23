import { Router } from 'express';
import {
  createUser,
  doLogin,
  refreshToken,
} from '../controllers/authController.ts';

const router = Router();

router.post('/login', doLogin);
router.post('/refresh', refreshToken);
router.post('/register', createUser);

export default router;
