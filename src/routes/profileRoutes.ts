import { Router } from 'express';
import {
  createProfile,
  getProfiles,
  getProfileById,
  updateProfileById,
  deleteProfileById,
  getProfileByUri,
} from '../controllers/profileController.ts';

const router = Router();

router.get('/', getProfiles);
router.get('/id/:id', getProfileById);
router.get('/uri/:uri', getProfileByUri);
router.post('/', createProfile);
router.patch('/:id', updateProfileById);
router.delete('/:id', deleteProfileById);

export default router;
