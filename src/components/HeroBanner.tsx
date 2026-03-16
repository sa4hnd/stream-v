import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '@/types';
import { getBackdropUrl } from '@/lib/tmdb';
import WatchlistButton from './WatchlistButton';

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const title = movie.title || movie.name || '';
  const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
  const backdrop = getBackdropUrl(movie.backdrop_path);

  return (
    <div className="relative w-full h-[80vh] min-h-[550px] max-h-[800px] rounded-b-[2rem] overflow-hidden">
      {/* Backdrop Image */}
      {backdrop && (
        <Image
          src={backdrop}
          alt={title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-black/20" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 w-full">
          <div className="max-w-lg animate-fade-up">
            {/* Title */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide leading-[0.95] mb-5">
              {title}
            </h1>

            {/* Overview */}
            <p className="text-white/70 text-sm sm:text-[15px] leading-relaxed mb-8 line-clamp-3">
              {movie.overview}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${type}/${movie.id}`}
                className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-7 py-3 rounded-full transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Watch Now
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </Link>
              <Link
                href={`/${type}/${movie.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-7 py-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10"
              >
                Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <WatchlistButton
                item={{
                  id: movie.id,
                  type,
                  title,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  addedAt: 0,
                }}
                variant="icon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
