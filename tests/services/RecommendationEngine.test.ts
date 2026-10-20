import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine } from '../../services/RecommendationEngine';
import type { User, Movie, Rating } from '../../models';

describe('Paso 4: Motor de Recomendaciones (RecommendationEngine)', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine(2); // K = 2 vecinos
  });

  describe('Validación del Prototipo Original de Fase I (Prueba_Algoritmo_CineMatch.ts)', () => {
    beforeEach(() => {
      // Registrar usuarios del prototipo de Fase 1
      const users: User[] = [
        { id: 'U1', name: 'Ana', email: 'ana@test.com' },
        { id: 'U2', name: 'Bruno', email: 'bruno@test.com' },
        { id: 'U3', name: 'Carla', email: 'carla@test.com' },
        { id: 'U4', name: 'Diego', email: 'diego@test.com' }
      ];
      users.forEach((u) => engine.registerUser(u));

      // Registrar películas del prototipo
      const movies: Movie[] = [
        { id: 'P1', title: 'Origen', year: 2010, genres: ['Sci-Fi'], duration: '2h', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.8, ratingCount: 1, releaseDate: '2010', type: 'movie' },
        { id: 'P2', title: 'Interestelar', year: 2014, genres: ['Sci-Fi'], duration: '2h', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.5, ratingCount: 1, releaseDate: '2014', type: 'movie' },
        { id: 'P3', title: 'Matrix', year: 1999, genres: ['Action'], duration: '2h', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.7, ratingCount: 1, releaseDate: '1999', type: 'movie' },
        { id: 'P4', title: 'Duna', year: 2021, genres: ['Sci-Fi'], duration: '2h', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.6, ratingCount: 1, releaseDate: '2021', type: 'movie' },
        { id: 'P5', title: 'El Padrino', year: 1972, genres: ['Drama'], duration: '3h', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.9, ratingCount: 1, releaseDate: '1972', type: 'movie' },
        { id: 'P6', title: 'Whiplash', year: 2014, genres: ['Drama'], duration: '1h 45m', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 4.8, ratingCount: 1, releaseDate: '2014', type: 'movie' }
      ];
      movies.forEach((m) => engine.registerMovie(m));

      // Calificaciones exactas de Fase 1
      const ratings: Rating[] = [
        // U1 (Usuario objetivo)
        { id: 'r1', userId: 'U1', movieId: 'P1', score: 5, createdAt: '2024-01-01' },
        { id: 'r2', userId: 'U1', movieId: 'P2', score: 3, createdAt: '2024-01-01' },
        { id: 'r3', userId: 'U1', movieId: 'P5', score: 4, createdAt: '2024-01-01' },

        // U2 (Candidato similar)
        { id: 'r4', userId: 'U2', movieId: 'P1', score: 5, createdAt: '2024-01-01' },
        { id: 'r5', userId: 'U2', movieId: 'P2', score: 4, createdAt: '2024-01-01' },
        { id: 'r6', userId: 'U2', movieId: 'P3', score: 5, createdAt: '2024-01-01' },
        { id: 'r7', userId: 'U2', movieId: 'P4', score: 4, createdAt: '2024-01-01' },

        // U3 (Candidato similar)
        { id: 'r8', userId: 'U3', movieId: 'P1', score: 4, createdAt: '2024-01-01' },
        { id: 'r9', userId: 'U3', movieId: 'P2', score: 3, createdAt: '2024-01-01' },
        { id: 'r10', userId: 'U3', movieId: 'P3', score: 4, createdAt: '2024-01-01' },
        { id: 'r11', userId: 'U3', movieId: 'P4', score: 5, createdAt: '2024-01-01' },

        // U4 (Sin películas compartidas con U1)
        { id: 'r12', userId: 'U4', movieId: 'P6', score: 5, createdAt: '2024-01-01' }
      ];
      ratings.forEach((r) => engine.registerRating(r));
    });

    it('debe calcular la Similitud del Coseno exactamente igual al prototipo de Fase 1', () => {
      // Similitud U1 <-> U2: aprox 0.9910
      const simU1_U2 = engine.calculateCosineSimilarity('U1', 'U2');
      expect(simU1_U2).toBeCloseTo(0.9910, 3);

      // Similitud U1 <-> U3: aprox 0.9947
      const simU1_U3 = engine.calculateCosineSimilarity('U1', 'U3');
      expect(simU1_U3).toBeCloseTo(0.9947, 3);

      // Similitud U1 <-> U4 (sin películas en común): 0.0
      const simU1_U4 = engine.calculateCosineSimilarity('U1', 'U4');
      expect(simU1_U4).toBe(0);
    });

    it('debe generar recomendaciones colaborativas para U1 excluyendo las que ya calificó (RN10)', () => {
      const recs = engine.generateRecommendations('U1', 2);

      expect(recs.length).toBe(2);
      expect(recs[0].strategy).toBe('collaborative');

      const recommendedIds = recs.map((r) => r.movie.id);
      // U1 ya calificó P1, P2 y P5; las candidatas con nota >= 4 de U2 y U3 son P3 y P4
      expect(recommendedIds).toContain('P3');
      expect(recommendedIds).toContain('P4');
      expect(recommendedIds).not.toContain('P1');
      expect(recommendedIds).not.toContain('P2');
      expect(recommendedIds).not.toContain('P5');
    });

    it('debe activar el mecanismo de respaldo para U4 por carecer de vecinos colaborativos (RN09)', () => {
      const recs = engine.generateRecommendations('U4', 3);

      expect(recs.length).toBeLessThanOrEqual(3);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].strategy).toBe('fallback_popularity');

      // U4 ya calificó P6, por lo que P6 NO debe ser recomendada (RN10)
      const recommendedIds = recs.map((r) => r.movie.id);
      expect(recommendedIds).not.toContain('P6');
    });
  });

  describe('Validación de Casos Límite y Reglas de Negocio', () => {
    it('debe lanzar error si el usuario no existe', () => {
      expect(() => engine.generateRecommendations('u_inexistente', 5)).toThrow(/no encontrado/);
    });

    it('debe rechazar calificaciones menores a 1 o mayores a 5 (RN03)', () => {
      const user: User = { id: 'u_test', name: 'Test', email: 'test@mail.com' };
      const movie: Movie = { id: 'm_test', title: 'Test', year: 2020, genres: [], duration: '', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 0, ratingCount: 0, releaseDate: '', type: 'movie' };
      engine.registerUser(user);
      engine.registerMovie(movie);

      expect(() =>
        engine.registerRating({ id: 'r_err', userId: 'u_test', movieId: 'm_test', score: 0, createdAt: '' })
      ).toThrow(/Calificación inválida/);

      expect(() =>
        engine.registerRating({ id: 'r_err', userId: 'u_test', movieId: 'm_test', score: 6, createdAt: '' })
      ).toThrow(/Calificación inválida/);
    });

    it('debe actualizar el promedio de calificación de la película al modificar una calificación (RN04)', () => {
      const user: User = { id: 'u_prom', name: 'Prom', email: 'p@mail.com' };
      const movie: Movie = { id: 'm_prom', title: 'Test Movie', year: 2020, genres: [], duration: '', synopsis: '', director: '', cast: [], posterUrl: '', backdropUrl: '', averageRating: 0, ratingCount: 0, releaseDate: '', type: 'movie' };
      engine.registerUser(user);
      engine.registerMovie(movie);

      // Primera calificación: 3 estrellas
      engine.registerRating({ id: 'r_p1', userId: 'u_prom', movieId: 'm_prom', score: 3, createdAt: '' });
      expect(engine.getMovie('m_prom')?.averageRating).toBe(3.0);
      expect(engine.getMovie('m_prom')?.ratingCount).toBe(1);

      // Modificación de la calificación a 5 estrellas
      engine.registerRating({ id: 'r_p1', userId: 'u_prom', movieId: 'm_prom', score: 5, createdAt: '' });
      expect(engine.getMovie('m_prom')?.averageRating).toBe(5.0);
      expect(engine.getMovie('m_prom')?.ratingCount).toBe(1); // Mantiene 1 sola calificación
    });

    it('debe respetar el límite de recomendaciones solicitado (RN08)', () => {
      const user: User = { id: 'u_lim', name: 'Lim', email: 'l@mail.com' };
      engine.registerUser(user);

      // Registramos 10 películas
      for (let i = 1; i <= 10; i++) {
        engine.registerMovie({
          id: `m_lim_${i}`,
          title: `Movie ${i}`,
          year: 2020,
          genres: [],
          duration: '',
          synopsis: '',
          director: '',
          cast: [],
          posterUrl: '',
          backdropUrl: '',
          averageRating: 4.0 + (i * 0.05),
          ratingCount: 10,
          releaseDate: '',
          type: 'movie'
        });
      }

      const recs = engine.generateRecommendations('u_lim', 3);
      expect(recs.length).toBe(3);
    });
  });
});
