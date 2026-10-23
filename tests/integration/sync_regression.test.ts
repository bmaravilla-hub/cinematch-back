import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { CatalogService } from '../../services/CatalogService';

describe('Punto 4: Pruebas de Regresión de Sincronización y Consistencia API-Frontend', () => {
  it('7. Comprobar que el catálogo de la API refleja el mismo promedio dinámico que el backend', async () => {
    // 1. Obtener la película m101 desde el servicio directo
    const service = CatalogService.getInstance();
    const movieInService = service.getMovieById('m101');
    expect(movieInService).toBeDefined();

    // 2. Obtener películas (lo que consume el frontend)
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);

    const movieInApi = res.body.data.find((m: any) => m.id === 'm101');
    expect(movieInApi).toBeDefined();
    expect(movieInApi.averageRating).toBe(movieInService?.averageRating);
    expect(movieInApi.ratingCount).toBe(movieInService?.ratingCount);
  });

  it('7.1 Registrar calificación vía POST actualiza promedios tanto en servicio como en GET /api/movies', async () => {
    // Calificar m108 con score 5
    const postRes = await request(app)
      .post('/api/ratings')
      .send({
        userId: 'u003',
        movieId: 'm108',
        score: 5,
        review: 'Obra maestra absoluta de ritmo cinematográfico.'
      });
    expect(postRes.status).toBe(200);
    expect(postRes.body.data.updatedMovie).toBeDefined();

    const expectedNewAvg = postRes.body.data.updatedMovie.averageRating;

    // Verificar en GET /api/movies
    const moviesRes = await request(app).get('/api/movies');
    const movieApi = moviesRes.body.data.find((m: any) => m.id === 'm108');
    expect(movieApi.averageRating).toBe(expectedNewAvg);
  });

  it('8. Rechazo del backend con 400 ante score inválido debe impedir el guardado', async () => {
    const invalidPostRes = await request(app)
      .post('/api/ratings')
      .send({
        userId: 'u001',
        movieId: 'm101',
        score: 99 // Inválido (RN03)
      });

    expect(invalidPostRes.status).toBe(400);
    expect(invalidPostRes.body.success).toBe(false);
    expect(invalidPostRes.body.message).toMatch(/entre 1 y 5/);
  });

  it('8.1 Consultar recomendaciones para un usuario no existente debe devolver 500/404 sin inventar datos', async () => {
    const recsRes = await request(app)
      .get('/api/recommendations')
      .query({ userId: 'u_usuario_inexistente_xyz', limit: 5 });

    expect(recsRes.status).toBe(404);
    expect(recsRes.body.success).toBe(false);
    expect(recsRes.body.data).toBeUndefined();
  });
});
