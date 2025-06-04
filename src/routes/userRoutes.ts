import { Router } from 'express';
import {
  createUser,
  doLogin,
  getMe,
  createUserProfiles,
} from '../controllers/userController.ts';

const router = Router();

router.post('/login', doLogin);
router.get('/:id', getMe);
router.patch('/:id/create', createUserProfiles);
router.post('/', createUser);

export default router;
