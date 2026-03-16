import { getTrending, getPopularMovies, getTopRatedMovies, getPopularTV, getTopRatedTV, getNowPlayingMovies } from '@/lib/tmdb';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import ContinueWatchingRow, { HeroLastWatched } from '@/components/ContinueWatching';

export default async function HomePage() {
  const [trending, popularMovies, topRatedMovies, nowPlaying, popularTV, topRatedTV] = await Promise.all([
    getTrending('week'),
    getPopularMovies(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
    getPopularTV(),
    getTopRatedTV(),
  ]);

  const heroMovie = trending.results[0];

  return (
    <div className="page-enter">
      {/* Hero: shows last watched if available, falls back to trending */}
      <HeroLastWatched
        fallbackHero={heroMovie ? <HeroBanner movie={heroMovie} /> : null}
      />

      <div className="-mt-20 relative z-10">
        {/* Continue Watching (client-side, only shows if history exists) */}
        <ContinueWatchingRow />

        <ContentRow title="Trending Movies" movies={trending.results.slice(1, 20)} />
        <ContentRow title="Popular Movies" movies={popularMovies.results} type="movie" />
        <ContentRow title="Now Playing" movies={nowPlaying.results} type="movie" />
        <ContentRow title="Top Rated" movies={topRatedMovies.results} type="movie" />
        <ContentRow title="Popular Series" movies={popularTV.results} type="tv" />
        <ContentRow title="Top Rated Series" movies={topRatedTV.results} type="tv" />
      </div>
    </div>
  );
}
