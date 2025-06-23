import { Router } from 'express';
import {
  createProfile,
  getProfileById,
  updateProfileById,
  deleteProfileById,
  getProfileByUri,
} from '../controllers/profileController.ts';

const router = Router();

router.get('/id/:id', getProfileById);
router.get('/uri/:uri', getProfileByUri);
router.post('/', createProfile);
router.patch('/', updateProfileById);
router.delete('/:id', deleteProfileById);

export default router;
