import { getPopularTV, getTopRatedTV, getAiringTodayTV, getTVGenres } from '@/lib/tmdb';
import ContentRow from '@/components/ContentRow';
import GenreList from '@/components/GenreList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Series - StreamV' };

export default async function TVPage() {
  const [popular, topRated, airingToday, genreData] = await Promise.all([
    getPopularTV(),
    getTopRatedTV(),
    getAiringTodayTV(),
    getTVGenres(),
  ]);

  return (
    <div className="pt-24 lg:pt-28 page-enter">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Series</h1>
        <p className="text-white/40 text-sm mb-6">Binge-worthy shows and must-watch television.</p>
        <GenreList genres={genreData.genres} />
      </div>

      <ContentRow title="Popular Series" movies={popular.results} type="tv" />
      <ContentRow title="Airing Today" movies={airingToday.results} type="tv" />
      <ContentRow title="Top Rated" movies={topRated.results} type="tv" />
    </div>
  );
}
