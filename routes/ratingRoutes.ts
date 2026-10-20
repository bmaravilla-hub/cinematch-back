import { Router } from 'express';
import { ratingController } from '../controllers/ratingController';

const router = Router();

router.post('/', ratingController.createOrUpdateRating);
router.get('/:userId', ratingController.getUserRatings);

export default router;
