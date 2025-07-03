import { Router } from 'express';
import {
  createProfileController,
  findProfileByIdController,
  findProfileByUriController,
  removeProfileController,
  updateProfileController,
} from '@/controllers/profiles.controller';

const router = Router();

router.get('/id/:id', findProfileByIdController);
router.get('/uri/:uri', findProfileByUriController);
router.post('/', createProfileController);
router.patch('/', updateProfileController);
router.delete('/:id', removeProfileController);

export default router;
