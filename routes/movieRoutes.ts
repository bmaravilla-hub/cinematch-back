import { Router } from 'express';
import { movieController } from '../controllers/movieController';

const router = Router();

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

export default router;
