import type { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';
import type { Rating } from '../models';

export const ratingController = {
  createOrUpdateRating: (req: Request, res: Response) => {
    try {
      const { userId, movieId, score, review } = req.body;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El identificador de usuario (userId) es obligatorio'
        });
      }

      if (!movieId || typeof movieId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El identificador de película (movieId) es obligatorio'
        });
      }

      const numScore = Number(score);
      if (isNaN(numScore) || numScore < 1 || numScore > 5) {
        return res.status(400).json({
          success: false,
          message: 'La calificación debe ser un valor numérico entre 1 y 5 (RN03)'
        });
      }

      const service = CatalogService.getInstance();

      // Validar existencia de usuario y película
      const user = service.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `El usuario '${userId}' no existe en el sistema`
        });
      }

      const movie = service.getMovieById(movieId);
      if (!movie) {
        return res.status(404).json({
          success: false,
          message: `La película '${movieId}' no existe en el sistema`
        });
      }

      const rating: Rating = {
        id: `r_${Date.now()}`,
        userId,
        movieId,
        score: numScore,
        createdAt: new Date().toISOString().split('T')[0],
        review: typeof review === 'string' ? review.trim() : undefined
      };

      const result = service.addOrUpdateRating(rating);

      res.status(200).json({
        success: true,
        message: 'Calificación registrada o actualizada exitosamente',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al procesar la calificación',
        error: error.message
      });
    }
  },

  getUserRatings: (req: Request, res: Response) => {
    try {
      const userId = String(req.params.userId);
      const service = CatalogService.getInstance();

      const user = service.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `El usuario '${userId}' no fue encontrado`
        });
      }

      const ratings = service.getUserRatings(userId);
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar las calificaciones del usuario',
        error: error.message
      });
    }
  }
};
