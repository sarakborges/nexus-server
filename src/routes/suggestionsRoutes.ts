import { Router } from 'express';
import { getSuggestionsByProfile } from '../controllers/suggestionsController.ts';

const router = Router();

router.get('/', getSuggestionsByProfile);

export default router;
