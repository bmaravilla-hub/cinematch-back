import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';

const router = Router();

router.get('/', recommendationController.getRecommendations);
router.get('/:userId', recommendationController.getRecommendations);

export default router;
