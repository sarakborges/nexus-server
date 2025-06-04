import { Router } from 'express';
import {
  createUser,
  doLogin,
  getMe,
  addProfileToUser,
} from '../controllers/userController.ts';

const router = Router();

router.post('/login', doLogin);
router.get('/:id', getMe);
router.patch('/:id/add', addProfileToUser);
router.post('/', createUser);

export default router;
