import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CatalogService, safeReplaceJsonSync } from '../../services/CatalogService';
import type { Rating } from '../../models';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testRatingsFile = path.resolve(__dirname, '../temp_ratings_store.json');

describe('Fase II - Validación Integral de Persistencia, Reconstrucción y Recuperación ante Fallos', () => {
  beforeAll(() => {
    // Asegurar que el archivo de prueba esté limpio antes de empezar
    if (fs.existsSync(testRatingsFile)) {
      try {
        fs.unlinkSync(testRatingsFile);
      } catch { }
    }
  });

  afterAll(() => {
    // Limpieza posterior de archivos temporales
    if (fs.existsSync(testRatingsFile)) {
      try {
        fs.unlinkSync(testRatingsFile);
      } catch { }
    }
  });

  // 1. Registrar una calificación nueva
  it('1. Debe registrar una calificación nueva, actualizar memoria (Grafo, Lista, Hash, AVL) y persistir en disco', () => {
    const service = CatalogService.resetInstance(testRatingsFile);
    expect(fs.existsSync(testRatingsFile)).toBe(true);

    const initialRatingsCount = service.getUserRatings('u005').length;
    expect(initialRatingsCount).toBe(0); // u005 inicia como usuario sin calificaciones

    const newRating: Rating = {
      id: 'r_persist_001',
      userId: 'u005',
      movieId: 'm105', // Cyber Blade 2099
      score: 5,
      createdAt: '2026-10-23',
      review: 'Visualmente perfecta y trascendental.'
    };

    const { rating, updatedMovie } = service.addOrUpdateRating(newRating);
    expect(rating.score).toBe(5);
    expect(updatedMovie).toBeDefined();

    // Verificación en memoria (Lista Enlazada)
    const userRatingsInMem = service.getUserRatings('u005');
    expect(userRatingsInMem.length).toBe(1);
    expect(userRatingsInMem[0].movieId).toBe('m105');
    expect(userRatingsInMem[0].score).toBe(5);

    // Verificación en el Grafo Bipartito
    const weightInGraph = service.getEngine().getGraph().getWeight('u005', 'm105');
    expect(weightInGraph).toBe(5);

    // Verificación en disco
    const content = JSON.parse(fs.readFileSync(testRatingsFile, 'utf-8'));
    const foundInDisk = content.find((r: Rating) => r.userId === 'u005' && r.movieId === 'm105');
    expect(foundInDisk).toBeDefined();
    expect(foundInDisk.score).toBe(5);
  });

  // 2. Actualizar una calificación existente
  it('2. Debe actualizar una calificación existente sin duplicar registros ni aristas', () => {
    const service = CatalogService.getInstance(testRatingsFile);

    const updatedRating: Rating = {
      id: 'r_persist_001_mod',
      userId: 'u005',
      movieId: 'm105',
      score: 4, // Actualización de 5 a 4
      createdAt: '2026-10-23',
      review: 'Revaluada: excelente pero ajustada a 4.'
    };

    service.addOrUpdateRating(updatedRating);

    // En memoria: sigue teniendo exactamente 1 calificación para u005
    const userRatings = service.getUserRatings('u005');
    expect(userRatings.length).toBe(1);
    expect(userRatings[0].score).toBe(4);

    // En el grafo: el peso se actualizó a 4
    const weightInGraph = service.getEngine().getGraph().getWeight('u005', 'm105');
    expect(weightInGraph).toBe(4);

    // En disco: el registro contiene el nuevo puntaje
    const content = JSON.parse(fs.readFileSync(testRatingsFile, 'utf-8'));
    const match = content.find((r: Rating) => r.userId === 'u005' && r.movieId === 'm105');
    expect(match).toBeDefined();
    expect(match.score).toBe(4);
  });

  // 3. Reiniciar backend y recuperar los datos
  it('3. Debe reiniciar el backend y reconstruir completamente Hash, Grafo, Lista y Árbol AVL', () => {
    // Simular reinicio del proceso del servidor creando una nueva instancia desde el archivo persistido
    const restartedService = CatalogService.resetInstance(testRatingsFile);

    // 3.1 Comprobar Lista Enlazada e Historial reconstruido
    const userRatingsAfterRestart = restartedService.getUserRatings('u005');
    expect(userRatingsAfterRestart.length).toBe(1);
    expect(userRatingsAfterRestart[0].movieId).toBe('m105');
    expect(userRatingsAfterRestart[0].score).toBe(4);

    // 3.2 Comprobar Grafo Bipartito reconstruido
    const graphWeight = restartedService.getEngine().getGraph().getWeight('u005', 'm105');
    expect(graphWeight).toBe(4);

    // 3.3 Comprobar Tabla Hash de Películas
    const movieInHash = restartedService.getMovieById('m105');
    expect(movieInHash).toBeDefined();
    expect(movieInHash?.title).toBe('Cyber Blade 2099');

    // 3.4 Comprobar Árbol AVL
    const moviesFromAVL = restartedService.getAllMovies();
    const movieInAVL = moviesFromAVL.find((m) => m.id === 'm105');
    expect(movieInAVL).toBeDefined();
    expect(movieInAVL?.averageRating).toBe(movieInHash?.averageRating);

    // 3.5 Comprobar exclusión de la película calificada en recomendaciones (RN10)
    const recs = restartedService.getRecommendations('u005', 6);
    const recIds = recs.map((r) => r.movie.id);
    expect(recIds).not.toContain('m105');
  });

  // 4. Simular una escritura fallida y comprobar consistencia de memoria y disco (Rollback)
  it('4. Debe realizar rollback automático en memoria si la escritura en disco falla (consistencia RAM-Disco)', () => {
    const service = CatalogService.getInstance(testRatingsFile);

    // Estado antes del fallo
    const diskBefore = fs.readFileSync(testRatingsFile, 'utf-8');
    const u005RatingsBefore = service.getUserRatings('u005');
    expect(u005RatingsBefore.length).toBe(1);
    expect(u005RatingsBefore[0].score).toBe(4);

    const movieM101Before = service.getMovieById('m101');
    const initialM101Rating = movieM101Before?.averageRating;
    const initialM101Count = movieM101Before?.ratingCount;

    // Intentar calificar m101 (nueva para u005), simulando error de I/O en disco durante writeFileSync
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      throw new Error('EIO: Error simulado de escritura en disco duro');
    });

    const failedRating: Rating = {
      id: 'r_fail_test',
      userId: 'u005',
      movieId: 'm101',
      score: 5,
      createdAt: '2026-10-23'
    };

    expect(() => service.addOrUpdateRating(failedRating)).toThrow(/Fallo de persistencia/);
    writeSpy.mockRestore();

    // Comprobar que en memoria RAM se ejecutó el ROLLBACK:
    // a) u005 NO debe tener m101 en su lista de calificaciones
    const u005RatingsAfter = service.getUserRatings('u005');
    expect(u005RatingsAfter.length).toBe(1);
    expect(u005RatingsAfter.some((r) => r.movieId === 'm101')).toBe(false);

    // b) En el Grafo NO debe existir la arista u005-m101
    const weightInGraph = service.getEngine().getGraph().getWeight('u005', 'm101');
    expect(weightInGraph).toBeNull();

    // c) En el Árbol AVL y Tabla Hash, m101 debe conservar sus valores intactos
    const movieM101After = service.getMovieById('m101');
    expect(movieM101After?.averageRating).toBe(initialM101Rating);
    expect(movieM101After?.ratingCount).toBe(initialM101Count);

    // d) En disco: el archivo no fue modificado
    const diskAfter = fs.readFileSync(testRatingsFile, 'utf-8');
    expect(diskAfter).toBe(diskBefore);
  });

  // 5. Verificar ausencia de duplicados
  it('5. Debe verificar ausencia estricta de duplicados en lista enlazada y en disco tras múltiples actualizaciones', () => {
    const service = CatalogService.getInstance(testRatingsFile);

    // Actualizar 3 veces la misma película para u005
    for (const score of [2, 3, 5]) {
      service.addOrUpdateRating({
        id: `r_dup_check_${score}`,
        userId: 'u005',
        movieId: 'm105',
        score,
        createdAt: '2026-10-23'
      });
    }

    // En memoria: debe haber únicamente 1 elemento para u005 y m105
    const userRatings = service.getUserRatings('u005');
    const m105Ratings = userRatings.filter((r) => r.movieId === 'm105');
    expect(m105Ratings.length).toBe(1);
    expect(m105Ratings[0].score).toBe(5);

    // En disco: exactamente 1 registro para u005 y m105
    const diskContent = JSON.parse(fs.readFileSync(testRatingsFile, 'utf-8'));
    const diskMatches = diskContent.filter((r: Rating) => r.userId === 'u005' && r.movieId === 'm105');
    expect(diskMatches.length).toBe(1);
    expect(diskMatches[0].score).toBe(5);
  });

  // 6. Validar promedios del catálogo después de reiniciar
  it('6. Debe validar que los promedios del Árbol AVL coincidan con la media aritmética calculada de las calificaciones tras reiniciar', () => {
    const service = CatalogService.resetInstance(testRatingsFile);

    // Comprobar promedio de m105 (Cyber Blade 2099)
    const diskContent: Rating[] = JSON.parse(fs.readFileSync(testRatingsFile, 'utf-8'));
    const m105Ratings = diskContent.filter((r) => r.movieId === 'm105');
    expect(m105Ratings.length).toBeGreaterThan(0);

    const expectedSum = m105Ratings.reduce((acc, r) => acc + r.score, 0);
    const expectedAvg = Number((expectedSum / m105Ratings.length).toFixed(1));

    const movieFromHash = service.getMovieById('m105');
    expect(movieFromHash?.averageRating).toBe(expectedAvg);
    expect(movieFromHash?.ratingCount).toBe(m105Ratings.length);

    const movieFromAVL = service.getAllMovies().find((m) => m.id === 'm105');
    expect(movieFromAVL?.averageRating).toBe(expectedAvg);
    expect(movieFromAVL?.ratingCount).toBe(m105Ratings.length);
  });

  // 7. Confirmar que un archivo temporal incompleto no reemplaza datos válidos
  it('7. Debe confirmar que una falla durante la escritura del archivo temporal no corrompe ni sobrescribe los datos válidos', () => {
    const validDataBefore = fs.readFileSync(testRatingsFile, 'utf-8');

    // Intentar safeReplaceJsonSync forzando fallo en writeFileSync
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementationOnce(() => {
      throw new Error('ENOSPC: No queda espacio en el dispositivo de almacenamiento');
    });

    expect(() => {
      safeReplaceJsonSync(testRatingsFile, [{ id: 'corrupt', userId: 'u000', movieId: 'm000', score: 1 }]);
    }).toThrow(/ENOSPC/);

    writeSpy.mockRestore();

    // Comprobar que el archivo original no fue modificado
    const validDataAfter = fs.readFileSync(testRatingsFile, 'utf-8');
    expect(validDataAfter).toBe(validDataBefore);

    // Comprobar que ningún archivo .tmp quedó huérfano en el directorio
    const dir = path.dirname(testRatingsFile);
    const orphanTemps = fs.readdirSync(dir).filter((f) => f.includes('.tmp.'));
    expect(orphanTemps.length).toBe(0);
  });
});
