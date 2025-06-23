import { Router } from 'express';
import { createUser, doLogin } from '../controllers/authController.ts';

const router = Router();

router.post('/login', doLogin);
router.post('/register', createUser);

export default router;
