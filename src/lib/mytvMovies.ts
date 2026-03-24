import { STREAM_API } from './streamApi';
import { MyTVMovie, MyTVSeries, MyTVMovieCategory, MyTVSeriesCategory } from '@/types';

export async function fetchMyTVMovies(query?: string, limit?: number): Promise<{ movies: MyTVMovie[]; categories: MyTVMovieCategory[]; count: number }> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  const res = await fetch(`${STREAM_API}/api/mytv/movies${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ movies');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ movies API error');
  return { movies: data.movies || [], categories: data.categories || [], count: data.count || 0 };
}

export async function fetchMyTVMovie(id: string): Promise<MyTVMovie> {
  const res = await fetch(`${STREAM_API}/api/mytv/movies/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ movie');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ movie API error');
  return data.movie;
}

export async function fetchMyTVSeries(query?: string, limit?: number): Promise<{ series: MyTVSeries[]; categories: MyTVSeriesCategory[]; count: number }> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  const res = await fetch(`${STREAM_API}/api/mytv/series${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ series');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ series API error');
  return { series: data.series || [], categories: data.categories || [], count: data.count || 0 };
}

export async function fetchMyTVSerie(id: string): Promise<MyTVSeries> {
  const res = await fetch(`${STREAM_API}/api/mytv/series/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ series');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ series API error');
  return data.serie;
}
