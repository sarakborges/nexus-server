import { Router } from 'express';
import {
  createUser,
  doLogin,
  getMe,
  addProfileToUser,
  removeProfileFromUser,
  changeUserActiveProfile,
  getProfilesByUser,
} from '../controllers/userController.ts';

const router = Router();

router.post('/login', doLogin);
router.get('/:id', getMe);
router.get('/:id/profiles', getProfilesByUser);
router.patch('/:id/add', addProfileToUser);
router.patch('/:id/remove', removeProfileFromUser);
router.patch('/:id/activeProfile', changeUserActiveProfile);
router.post('/', createUser);

export default router;
