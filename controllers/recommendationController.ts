import type { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';

export const recommendationController = {
  getRecommendations: (req: Request, res: Response) => {
    try {
      const userId = (req.query.userId as string) || (req.params.userId as string);
      const limitRaw = req.query.limit as string;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El parámetro userId es requerido para generar recomendaciones'
        });
      }

      let limit = 5;
      if (limitRaw !== undefined) {
        const parsedLimit = parseInt(limitRaw, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
          return res.status(400).json({
            success: false,
            message: 'El parámetro limit debe ser un número entero positivo'
          });
        }
        limit = Math.min(parsedLimit, 20); // Cap de seguridad
      }

      const service = CatalogService.getInstance();
      const user = service.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `El usuario '${userId}' no existe en el sistema`
        });
      }

      const recommendations = service.getRecommendations(userId, limit);

      res.status(200).json({
        success: true,
        userId,
        limit,
        count: recommendations.length,
        data: recommendations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al generar recomendaciones',
        error: error.message
      });
    }
  }
};
