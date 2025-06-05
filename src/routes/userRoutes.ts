import { Router } from 'express';
import {
  createUser,
  doLogin,
  getMe,
  addProfileToUser,
  removeProfileFromUser,
  changeUserActiveProfile,
} from '../controllers/userController.ts';

const router = Router();

router.post('/login', doLogin);
router.get('/:id', getMe);
router.patch('/:id/add', addProfileToUser);
router.patch('/:id/remove', removeProfileFromUser);
router.patch('/:id/activeProfile', changeUserActiveProfile);
router.post('/', createUser);

export default router;
