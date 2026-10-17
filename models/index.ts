export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  myListMovieIds?: string[];
}

export type MovieType = 'movie' | 'series';

export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  duration: string;
  synopsis: string;
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  averageRating: number; // Promedio dinámico calculado
  ratingCount: number;   // Cantidad de calificaciones recibidas
  releaseDate: string;
  type: MovieType;
  trending?: boolean;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  score: number; // 1 a 5
  createdAt: string;
  review?: string;
}

export interface RecommendationResult {
  movie: Movie;
  score: number;
  strategy: 'collaborative' | 'fallback_popularity';
  reason: string;
}
