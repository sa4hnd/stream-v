import { Movie, MovieDetail, Genre, SeasonDetail, TMDBResponse } from '@/types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500') => {
  if (!path) return '/no-poster.svg';
  return `${IMG_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = 'original') => {
  if (!path) return null;
  return `${IMG_BASE}/${size}${path}`;
};

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
  const searchParams = new URLSearchParams({ api_key: key, ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    console.error(`TMDB Error: ${res.status} for ${endpoint} (key: ${key ? key.slice(0, 4) + '...' : 'MISSING'})`);
    throw new Error(`TMDB Error: ${res.status}`);
  }
  return res.json();
}

// Trending
export const getTrending = (timeWindow: 'day' | 'week' = 'week') =>
  fetchTMDB<TMDBResponse<Movie>>(`/trending/all/${timeWindow}`);

// Movies
export const getPopularMovies = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/movie/popular', { page: String(page) });

export const getTopRatedMovies = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/movie/top_rated', { page: String(page) });

export const getNowPlayingMovies = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/movie/now_playing', { page: String(page) });

export const getUpcomingMovies = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/movie/upcoming', { page: String(page) });

// TV Shows
export const getPopularTV = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/tv/popular', { page: String(page) });

export const getTopRatedTV = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/tv/top_rated', { page: String(page) });

export const getAiringTodayTV = (page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/tv/airing_today', { page: String(page) });

// Details
export const getMovieDetail = (id: number) =>
  fetchTMDB<MovieDetail>(`/movie/${id}`, { append_to_response: 'videos,credits,similar,recommendations' });

export const getTVDetail = (id: number) =>
  fetchTMDB<MovieDetail>(`/tv/${id}`, { append_to_response: 'videos,credits,similar,recommendations' });

export const getSeasonDetail = (tvId: number, seasonNumber: number) =>
  fetchTMDB<SeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);

// Search
export const searchMulti = (query: string, page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/search/multi', { query, page: String(page) });

export const searchMovies = (query: string, page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/search/movie', { query, page: String(page) });

export const searchTV = (query: string, page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/search/tv', { query, page: String(page) });

// Genres
export const getMovieGenres = () =>
  fetchTMDB<{ genres: Genre[] }>('/genre/movie/list');

export const getTVGenres = () =>
  fetchTMDB<{ genres: Genre[] }>('/genre/tv/list');

// Discover
export const discoverMovies = (params: Record<string, string> = {}, page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/discover/movie', { page: String(page), ...params });

export const discoverTV = (params: Record<string, string> = {}, page = 1) =>
  fetchTMDB<TMDBResponse<Movie>>('/discover/tv', { page: String(page), ...params });

// Genre-specific
export const getMoviesByGenre = (genreId: number, page = 1) =>
  discoverMovies({ with_genres: String(genreId), sort_by: 'popularity.desc' }, page);

export const getTVByGenre = (genreId: number, page = 1) =>
  discoverTV({ with_genres: String(genreId), sort_by: 'popularity.desc' }, page);
