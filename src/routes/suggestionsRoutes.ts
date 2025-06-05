import { Router } from 'express';
import { getSuggestionsByProfile } from '../controllers/suggestionsController.ts';

const router = Router();

router.get('/:id', getSuggestionsByProfile);

export default router;
