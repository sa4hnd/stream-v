'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MyTVMovie, MyTVSeries, MyTVMovieCategory, MyTVSeriesCategory } from '@/types';

interface Props {
  initialMovies: MyTVMovie[];
  initialSeries: MyTVSeries[];
  movieCategories: MyTVMovieCategory[];
  seriesCategories: MyTVSeriesCategory[];
}

function MovieCard({ movie }: { movie: MyTVMovie }) {
  return (
    <Link
      href={`/mytv/movie/${movie.id}`}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] hover:scale-[1.02] transition-all duration-200"
    >
      <div className="aspect-[2/3] relative">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
            <span className="text-2xl font-bold text-white/20">{movie.title.slice(0, 2)}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{movie.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating && <span>&#9733; {movie.rating}</span>}
          </div>
          {/* Play icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/20">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-white/80 truncate">{movie.title}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{movie.category}</p>
      </div>
    </Link>
  );
}

function SeriesCard({ serie }: { serie: MyTVSeries }) {
  const episodeCount = serie.seasons.reduce((t, s) => t + s.episodes.length, 0);
  return (
    <Link
      href={`/mytv/series/${serie.id}`}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] hover:scale-[1.02] transition-all duration-200"
    >
      <div className="aspect-[2/3] relative">
        {serie.poster ? (
          <img
            src={serie.poster}
            alt={serie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
            <span className="text-2xl font-bold text-white/20">{serie.title.slice(0, 2)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-xs font-semibold line-clamp-2 mb-1">{serie.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-white/60">
            {serie.year && <span>{serie.year}</span>}
            {serie.seasons.length > 0 && <span>{serie.seasons.length}S</span>}
            {episodeCount > 0 && <span>{episodeCount}E</span>}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 border border-white/20">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-white/80 truncate">{serie.title}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{serie.category}</p>
      </div>
    </Link>
  );
}

export default function MyTVBrowse({ initialMovies, initialSeries, movieCategories, seriesCategories }: Props) {
  const [tab, setTab] = useState<'movies' | 'series'>('movies');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredMovies = useMemo(() => {
    let items = initialMovies;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(m => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      items = items.filter(m => m.category === selectedCategory);
    }
    return items;
  }, [initialMovies, search, selectedCategory]);

  const filteredSeries = useMemo(() => {
    let items = initialSeries;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(s => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      items = items.filter(s => s.category === selectedCategory);
    }
    return items;
  }, [initialSeries, search, selectedCategory]);

  const categories = tab === 'movies'
    ? movieCategories.map(c => c.name)
    : seriesCategories.map(c => c.name);

  return (
    <div className="space-y-6">
      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
          <button
            onClick={() => { setTab('movies'); setSelectedCategory(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'movies' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => { setTab('series'); setSelectedCategory(''); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'series' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
            }`}
          >
            Series
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !selectedCategory ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {tab === 'movies' ? (
        filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">{search ? 'No movies found' : 'No movies available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredMovies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )
      ) : (
        filteredSeries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">{search ? 'No series found' : 'No series available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredSeries.map(s => <SeriesCard key={s.id} serie={s} />)}
          </div>
        )
      )}
    </div>
  );
}
