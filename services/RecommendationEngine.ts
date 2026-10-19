import { HashTable } from '../structures/HashTable';
import { LinkedList } from '../structures/LinkedList';
import { BipartiteGraph } from '../structures/BipartiteGraph';
import { AVLTree } from '../structures/AVLTree';
import { PriorityQueue } from '../structures/PriorityQueue';
import type { User, Movie, Rating, RecommendationResult } from '../models';

export class RecommendationEngine {
  private usersHash: HashTable<string, User>;
  private moviesHash: HashTable<string, Movie>;
  private graph: BipartiteGraph;
  private moviesAVL: AVLTree<Movie>;
  private ratingsList: LinkedList<Rating>;
  private kNeighbors: number = 2;

  constructor(kNeighbors: number = 2) {
    this.kNeighbors = kNeighbors;
    this.usersHash = new HashTable<string, User>(32);
    this.moviesHash = new HashTable<string, Movie>(64);
    this.graph = new BipartiteGraph();
    this.moviesAVL = new AVLTree<Movie>();
    this.ratingsList = new LinkedList<Rating>();
  }


  public registerUser(user: User): void {
    if (!user.id) throw new Error("El ID del usuario es requerido");
    this.usersHash.set(user.id, user);
    this.graph.addNode(user.id, 'user');
  }


  public registerMovie(movie: Movie): void {
    if (!movie.id) throw new Error("El ID de la película es requerido");
    this.moviesHash.set(movie.id, movie);
    this.graph.addNode(movie.id, 'movie');

    const avlKey = AVLTree.buildMovieKey(movie.title, movie.id);
    this.moviesAVL.insert(avlKey, movie);
  }


  public registerRating(rating: Rating): void {
    const user = this.usersHash.get(rating.userId);
    if (!user) {
      throw new Error(`Usuario con ID ${rating.userId} no existe en el sistema`);
    }

    const movie = this.moviesHash.get(rating.movieId);
    if (!movie) {
      throw new Error(`Película con ID ${rating.movieId} no existe en el sistema`);
    }

    if (rating.score < 1 || rating.score > 5) {
      throw new Error(`Calificación inválida: ${rating.score}. Debe encontrarse entre 1 y 5.`);
    }

    this.graph.addEdge(rating.userId, rating.movieId, rating.score);

    this.ratingsList.insertOrUpdate(
      (r) => r.userId === rating.userId && r.movieId === rating.movieId,
      rating,
      true
    );

    this.recalculateMovieAverage(rating.movieId);
  }


  public getRating(userId: string, movieId: string): Rating | null {
    const found = this.ratingsList.find((r) => r.userId === userId && r.movieId === movieId);
    return found ? { ...found } : null;
  }


  public rollbackRating(userId: string, movieId: string, previousRating: Rating | null): void {
    if (previousRating !== null) {
      this.graph.addEdge(userId, movieId, previousRating.score);
      this.ratingsList.insertOrUpdate(
        (r) => r.userId === userId && r.movieId === movieId,
        previousRating,
        true
      );
    } else {
      this.graph.removeEdge(userId, movieId);
      this.ratingsList.remove((r) => r.userId === userId && r.movieId === movieId);
    }

    this.recalculateMovieAverage(movieId);
  }


  private recalculateMovieAverage(movieId: string): void {
    const movie = this.moviesHash.get(movieId);
    if (!movie) return;

    const userRatings = this.graph.getUsersWhoRatedMovie(movieId);
    if (userRatings.length === 0) {
      movie.averageRating = 0;
      movie.ratingCount = 0;
    } else {
      const sum = userRatings.reduce((acc, r) => acc + r.score, 0);
      movie.averageRating = Number((sum / userRatings.length).toFixed(1));
      movie.ratingCount = userRatings.length;
    }

    const avlKey = AVLTree.buildMovieKey(movie.title, movie.id);
    this.moviesAVL.insert(avlKey, movie);
  }


  public calculateCosineSimilarity(userA: string, userB: string): number {
    const ratingsA = this.graph.getMoviesRatedByUser(userA);
    if (ratingsA.length === 0) return 0;

    let numerador = 0;
    let sumaCuadradosA = 0;
    let sumaCuadradosB = 0;
    let coincidencias = 0;

    for (const rA of ratingsA) {
      const weightB = this.graph.getWeight(userB, rA.movieId);
      if (weightB !== null) {
        numerador += rA.score * weightB;
        sumaCuadradosA += rA.score * rA.score;
        sumaCuadradosB += weightB * weightB;
        coincidencias++;
      }
    }

    if (coincidencias === 0 || sumaCuadradosA === 0 || sumaCuadradosB === 0) {
      return 0;
    }

    const denominador = Math.sqrt(sumaCuadradosA) * Math.sqrt(sumaCuadradosB);
    if (denominador === 0) return 0;

    return numerador / denominador;
  }

  public getFallbackRecommendations(userId: string, limit: number): RecommendationResult[] {
    const colaPopularidad = new PriorityQueue<Movie>();
    const allMoviesInAVL = this.moviesAVL.inOrder();

    for (const movie of allMoviesInAVL) {
      const alreadyRated = this.graph.getWeight(userId, movie.id) !== null;
      if (!alreadyRated) {
        colaPopularidad.insert(movie, movie.averageRating);
      }
    }

    const results: RecommendationResult[] = [];
    while (results.length < limit && !colaPopularidad.isEmpty()) {
      const item = colaPopularidad.extractMax();
      if (item) {
        results.push({
          movie: item.element,
          score: item.priority,
          strategy: 'fallback_popularity',
          reason: `Película destacada del catálogo con promedio de ${item.priority.toFixed(1)} ★`
        });
      }
    }

    return results;
  }


  public generateRecommendations(userId: string, limit: number = 5): RecommendationResult[] {
    if (limit <= 0) return [];

    const currentUser = this.usersHash.get(userId);
    if (!currentUser) {
      throw new Error(`Usuario ${userId} no encontrado en la base de datos.`);
    }

    const candidateUsers = this.graph.getSharedCandidateUsers(userId);

    if (candidateUsers.length === 0) {
      return this.getFallbackRecommendations(userId, limit);
    }

    const colaUsuarios = new PriorityQueue<string>();
    for (const candidateId of candidateUsers) {
      const similarity = this.calculateCosineSimilarity(userId, candidateId);
      if (similarity > 0) {
        colaUsuarios.insert(candidateId, similarity);
      }
    }

    if (colaUsuarios.isEmpty()) {
      return this.getFallbackRecommendations(userId, limit);
    }

    const sumaPonderada = new HashTable<string, number>(16);
    const sumaSimilitudes = new HashTable<string, number>(16);

    let countK = 0;
    while (countK < this.kNeighbors && !colaUsuarios.isEmpty()) {
      const neighborItem = colaUsuarios.extractMax();
      if (!neighborItem) break;

      const neighborId = neighborItem.element;
      const sim = neighborItem.priority;

      const neighborRatings = this.graph.getMoviesRatedByUser(neighborId);
      for (const rating of neighborRatings) {
        const movieId = rating.movieId;


        const alreadyRated = this.graph.getWeight(userId, movieId) !== null;
        if (rating.score >= 4 && !alreadyRated) {
          const prevAcumulado = sumaPonderada.get(movieId) ?? 0;
          const prevSim = sumaSimilitudes.get(movieId) ?? 0;

          sumaPonderada.set(movieId, prevAcumulado + (sim * rating.score));
          sumaSimilitudes.set(movieId, prevSim + sim);
        }
      }

      countK++;
    }

    const colaRecomendaciones = new PriorityQueue<Movie>();
    for (const movieId of sumaPonderada.keys()) {
      const numerador = sumaPonderada.get(movieId) ?? 0;
      const denominador = sumaSimilitudes.get(movieId) ?? 0;

      if (denominador > 0) {
        const finalScore = Number((numerador / denominador).toFixed(2));
        const movie = this.moviesHash.get(movieId);
        if (movie) {
          colaRecomendaciones.insert(movie, finalScore);
        }
      }
    }

    const collaborativeRecs: RecommendationResult[] = [];
    while (collaborativeRecs.length < limit && !colaRecomendaciones.isEmpty()) {
      const item = colaRecomendaciones.extractMax();
      if (item) {
        collaborativeRecs.push({
          movie: item.element,
          score: item.priority,
          strategy: 'collaborative',
          reason: `Recomendada por usuarios con gustos afines (Score: ${item.priority.toFixed(2)})`
        });
      }
    }

    if (collaborativeRecs.length === 0) {
      return this.getFallbackRecommendations(userId, limit);
    }

    if (collaborativeRecs.length < limit) {
      const fallbackRecs = this.getFallbackRecommendations(userId, limit);
      for (const fb of fallbackRecs) {
        if (!collaborativeRecs.some((c) => c.movie.id === fb.movie.id)) {
          collaborativeRecs.push(fb);
          if (collaborativeRecs.length >= limit) break;
        }
      }
    }

    return collaborativeRecs;
  }

  public getUser(id: string): User | undefined {
    return this.usersHash.get(id);
  }

  public getMovie(id: string): Movie | undefined {
    return this.moviesHash.get(id);
  }

  public getAllMoviesFromAVL(): Movie[] {
    return this.moviesAVL.inOrder();
  }

  public getAllRatings(): Rating[] {
    return this.ratingsList.toArray();
  }

  public getUserRatings(userId: string): Rating[] {
    return this.ratingsList.toArray().filter((r) => r.userId === userId);
  }

  public getGraph(): BipartiteGraph {
    return this.graph;
  }
}
