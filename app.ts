import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Recurso no encontrado en el servidor de CineMatch'
    });
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: err.message
    });
  });

  return app;
};

export const app = createApp();
