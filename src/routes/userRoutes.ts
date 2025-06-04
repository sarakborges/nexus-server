import { Router } from 'express';
import {
  createUser,
  doLogin,
  getMe,
  updateUserProfiles,
} from '../controllers/userController.ts';

const router = Router();

router.post('/login', doLogin);
router.get('/:id', getMe);
router.patch('/:id', updateUserProfiles);
router.post('/', createUser);

export default router;
