import { Router } from 'express';
import {
  getMe,
  addProfileToUser,
  removeProfileFromUser,
  changeUserActiveProfile,
} from '../controllers/userController.ts';

const router = Router();

router.get('/me', getMe);
router.patch('/add', addProfileToUser);
router.patch('/remove', removeProfileFromUser);
router.patch('/activeProfile', changeUserActiveProfile);

export default router;
