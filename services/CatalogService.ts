import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RecommendationEngine } from './RecommendationEngine';
import type { Movie, User, Rating, RecommendationResult } from '../models';

import moviesData from '../data/movies.json';
import usersData from '../data/users.json';
import seedRatingsData from '../data/ratings.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function safeReplaceJsonSync(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempFilePath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const content = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(tempFilePath, content, { encoding: 'utf-8', flag: 'w' });

    try {
      fs.renameSync(tempFilePath, filePath);
    } catch (renameErr: any) {
      if (['EPERM', 'EBUSY', 'EACCES', 'EEXIST'].includes(renameErr.code)) {
        fs.copyFileSync(tempFilePath, filePath);
        fs.unlinkSync(tempFilePath);
      } else {
        throw renameErr;
      }
    }
  } catch (error) {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch { }
    }
    throw error;
  }
}

export class CatalogService {
  private static instance: CatalogService | null = null;
  private engine: RecommendationEngine;
  private ratingsFilePath: string;

  constructor(customRatingsFilePath?: string) {
    this.ratingsFilePath =
      customRatingsFilePath ||
      process.env.RATINGS_FILE_PATH ||
      path.resolve(__dirname, '../data/ratings.store.json');

    this.engine = new RecommendationEngine(2);
    this.initializeData();
  }

  public static getInstance(customRatingsFilePath?: string): CatalogService {
    if (!CatalogService.instance) {
      CatalogService.instance = new CatalogService(customRatingsFilePath);
    }
    return CatalogService.instance;
  }


  public static resetInstance(customRatingsFilePath?: string): CatalogService {
    CatalogService.instance = new CatalogService(customRatingsFilePath);
    return CatalogService.instance;
  }


  public initializeData(): void {
    for (const user of usersData as User[]) {
      this.engine.registerUser(user);
    }
    for (const movie of moviesData as Movie[]) {
      this.engine.registerMovie(movie);
    }

    let ratingsToLoad: Rating[] = [];

    if (fs.existsSync(this.ratingsFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.ratingsFilePath, 'utf-8').trim();
        if (fileContent) {
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            ratingsToLoad = parsed;
          }
        }
      } catch (err) {
        console.warn(`[CatalogService] Error leyendo archivo de persistencia ${this.ratingsFilePath}, usando semilla:`, err);
        ratingsToLoad = seedRatingsData as Rating[];
      }
    } else {

      ratingsToLoad = seedRatingsData as Rating[];
      try {
        safeReplaceJsonSync(this.ratingsFilePath, ratingsToLoad);
      } catch (err) {
        console.warn(`[CatalogService] No se pudo crear archivo inicial de persistencia:`, err);
      }
    }


    for (const rating of ratingsToLoad) {
      this.engine.registerRating(rating);
    }
  }

  public getAllMovies(): Movie[] {

    return this.engine.getAllMoviesFromAVL();
  }

  public getMovieById(id: string): Movie | undefined {

    return this.engine.getMovie(id);
  }

  public getUserById(id: string): User | undefined {
    return this.engine.getUser(id);
  }


  public addOrUpdateRating(rating: Rating): { rating: Rating; updatedMovie?: Movie } {
    const previousRating = this.engine.getRating(rating.userId, rating.movieId);

    this.engine.registerRating(rating);
    const updatedMovie = this.engine.getMovie(rating.movieId);

    try {
      const allRatings = this.engine.getAllRatings();
      safeReplaceJsonSync(this.ratingsFilePath, allRatings);
    } catch (err) {
      this.engine.rollbackRating(rating.userId, rating.movieId, previousRating);
      console.error(`[CatalogService] Error al persistir calificaciones en ${this.ratingsFilePath}. Rollback ejecutado:`, err);
      throw new Error(`Fallo de persistencia: no se pudo guardar en disco y se restauró el estado en memoria. Causa: ${(err as Error).message}`);
    }

    return { rating, updatedMovie };
  }

  public getUserRatings(userId: string): Rating[] {
    return this.engine.getUserRatings(userId);
  }

  public getRecommendations(userId: string, limit: number = 5): RecommendationResult[] {
    return this.engine.generateRecommendations(userId, limit);
  }

  public getEngine(): RecommendationEngine {
    return this.engine;
  }

  public getRatingsFilePath(): string {
    return this.ratingsFilePath;
  }
}
