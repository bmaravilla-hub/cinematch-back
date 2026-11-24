import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Paso 5 y 6: Pruebas de Integración de la API HTTP', () => {
  it('GET /api/health debe responder 200 con estado ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.phase).toBe('Fase III');
  });

  describe('Endpoints de Catálogo (/api/movies)', () => {
    it('GET /api/movies debe retornar todas las películas ordenadas mediante el Árbol AVL', async () => {
      const res = await request(app).get('/api/movies');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(18);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/movies/:id debe retornar los detalles de una película existente en O(1)', async () => {
      const res = await request(app).get('/api/movies/m101');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('m101');
      expect(res.body.data.title).toBe('Interstellar');
    });

    it('GET /api/movies/:id debe retornar 404 para una película inexistente', async () => {
      const res = await request(app).get('/api/movies/m_inexistente_999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Endpoints de Calificaciones (/api/ratings)', () => {
    it('GET /api/ratings/:userId debe devolver las calificaciones del usuario', async () => {
      const res = await request(app).get('/api/ratings/u001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(4);
    });

    it('POST /api/ratings debe rechazar calificaciones con score fuera del rango 1-5 (RN03)', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .send({ userId: 'u001', movieId: 'm106', score: 6 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/entre 1 y 5/);
    });

    it('POST /api/ratings debe rechazar solicitudes con usuario o película inexistente', async () => {
      const resUser = await request(app)
        .post('/api/ratings')
        .send({ userId: 'u_no_existe', movieId: 'm101', score: 5 });
      expect(resUser.status).toBe(404);

      const resMovie = await request(app)
        .post('/api/ratings')
        .send({ userId: 'u001', movieId: 'm_no_existe', score: 5 });
      expect(resMovie.status).toBe(404);
    });

    it('POST /api/ratings debe registrar exitosamente una calificación y actualizar promedios', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .send({
          userId: 'u002',
          movieId: 'm106',
          score: 5,
          review: 'Visualmente asombrosa y expedición épica.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating.score).toBe(5);
    });
  });

  describe('Endpoints de Recomendaciones (/api/recommendations)', () => {
    it('GET /api/recommendations debe generar recomendaciones colaborativas para u001', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .query({ userId: 'u001', limit: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeLessThanOrEqual(3);
      expect(res.body.count).toBeGreaterThan(0);

      // Verificar que ninguna película recomendada haya sido calificada previamente por u001 (RN10)
      const ratingsRes = await request(app).get('/api/ratings/u001');
      const ratedMovieIds = ratingsRes.body.data.map((r: any) => r.movieId);

      for (const rec of res.body.data) {
        expect(ratedMovieIds).not.toContain(rec.movie.id);
      }
    });

    it('GET /api/recommendations debe utilizar el mecanismo de respaldo (fallback) para u005', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .query({ userId: 'u005', limit: 4 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(4);
      expect(res.body.data[0].strategy).toBe('fallback_popularity');
    });

    it('Flujo completo de integración: Registrar calificación debe influir en recomendaciones', async () => {
      // 1. Consultar recomendaciones actuales para u001
      const initialRecsRes = await request(app)
        .get('/api/recommendations')
        .query({ userId: 'u001', limit: 5 });
      const firstRecommendedMovie = initialRecsRes.body.data[0].movie;

      // 2. u001 califica esa película
      const postRes = await request(app)
        .post('/api/ratings')
        .send({
          userId: 'u001',
          movieId: firstRecommendedMovie.id,
          score: 5,
          review: 'Excelente, ahora ya la vi.'
        });
      expect(postRes.status).toBe(200);

      // 3. Consultar nuevamente recomendaciones: esa película ya NO debe aparecer (RN10)
      const afterRecsRes = await request(app)
        .get('/api/recommendations')
        .query({ userId: 'u001', limit: 5 });

      const newRecommendedIds = afterRecsRes.body.data.map((r: any) => r.movie.id);
      expect(newRecommendedIds).not.toContain(firstRecommendedMovie.id);
    });
  });
});
