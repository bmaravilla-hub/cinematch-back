import { Router } from 'express';
import movieRoutes from './movieRoutes';
import ratingRoutes from './ratingRoutes';
import recommendationRoutes from './recommendationRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    project: 'CineMatch PED941',
    phase: 'Fase II',
    timestamp: new Date().toISOString()
  });
});

router.use('/movies', movieRoutes);
router.use('/ratings', ratingRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;
