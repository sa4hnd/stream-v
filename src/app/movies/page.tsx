import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getMovieGenres } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import GenreList from '@/components/GenreList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Movies - StreamV' };

export default async function MoviesPage() {
  const [popular, topRated, nowPlaying, upcoming, genreData] = await Promise.all([
    getPopularMovies(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
    getUpcomingMovies(),
    getMovieGenres(),
  ]);

  return (
    <div className="pt-24 lg:pt-28 page-enter">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Movies</h1>
        <p className="text-white/40 text-sm mb-6">Discover the latest and greatest films.</p>
        <GenreList genres={genreData.genres} />
      </div>

      <ContentRow title="Popular Right Now" movies={popular.results} type="movie" />
      <ContentRow title="Now in Theaters" movies={nowPlaying.results} type="movie" />
      <ContentRow title="Top Rated" movies={topRated.results} type="movie" />
      <ContentRow title="Coming Soon" movies={upcoming.results} type="movie" />
    </div>
  );
}
