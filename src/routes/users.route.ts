import { Router } from 'express';
import {
  getMeController,
  changeUserActiveProfileController,
} from '@/controllers/users.controller.ts';

const router = Router();

router.get('/me', getMeController);
router.patch('/activeProfile', changeUserActiveProfileController);

export default router;
