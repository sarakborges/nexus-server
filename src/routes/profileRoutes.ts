import { Router } from 'express';
import {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfileById,
  deleteProfileById,
} from '../controllers/profileController.ts';

const router = Router();

router.get('/', getProfiles);
router.get('/:id', getProfileById);
router.post('/', createProfile);
router.put('/:id', updateProfileById);
router.delete('/:id', deleteProfileById);

export default router;
