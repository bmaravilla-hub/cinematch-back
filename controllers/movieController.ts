import type { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';

export const movieController = {
  getAllMovies: (_req: Request, res: Response) => {
    try {
      const service = CatalogService.getInstance();
      const movies = service.getAllMovies();
      res.status(200).json({
        success: true,
        count: movies.length,
        data: movies
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el catálogo de películas',
        error: error.message
      });
    }
  },

  getMovieById: (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const service = CatalogService.getInstance();
      const movie = service.getMovieById(id);

      if (!movie) {
        return res.status(404).json({
          success: false,
          message: `Película con ID '${id}' no encontrada`
        });
      }

      res.status(200).json({
        success: true,
        data: movie
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar la película',
        error: error.message
      });
    }
  }
};
