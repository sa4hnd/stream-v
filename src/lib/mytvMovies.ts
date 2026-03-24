import { STREAM_API } from './streamApi';
import { MyTVMovie, MyTVSeries, MyTVMovieCategory, MyTVSeriesCategory } from '@/types';

export async function fetchMyTVMovies(query?: string): Promise<{ movies: MyTVMovie[]; categories: MyTVMovieCategory[]; count: number }> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await fetch(`${STREAM_API}/api/mytv/movies${qs}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ movies');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ movies API error');
  return { movies: data.movies || [], categories: data.categories || [], count: data.count || 0 };
}

export async function fetchMyTVMovie(id: string): Promise<MyTVMovie> {
  const res = await fetch(`${STREAM_API}/api/mytv/movies/${id}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ movie');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ movie API error');
  return data.movie;
}

export async function fetchMyTVSeries(query?: string): Promise<{ series: MyTVSeries[]; categories: MyTVSeriesCategory[]; count: number }> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await fetch(`${STREAM_API}/api/mytv/series${qs}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ series');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ series API error');
  return { series: data.series || [], categories: data.categories || [], count: data.count || 0 };
}

export async function fetchMyTVSerie(id: string): Promise<MyTVSeries> {
  const res = await fetch(`${STREAM_API}/api/mytv/series/${id}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch MyTV+ series');
  const data = await res.json();
  if (!data.success) throw new Error('MyTV+ series API error');
  return data.serie;
}
