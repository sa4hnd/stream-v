'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { isWatched, getProgress } from '@/lib/history';

interface ContentCardProps {
  movie: Movie;
  type?: 'movie' | 'tv';
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ContentCard({ movie, type, index = 0, size = 'md' }: ContentCardProps) {
  const title = movie.title || movie.name || '';
  const mediaType = type || (movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie');
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average?.toFixed(1);
  const [watched, setWatched] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setWatched(isWatched(movie.id, mediaType as 'movie' | 'tv'));
    setProgress(getProgress(movie.id, mediaType as 'movie' | 'tv'));
  }, [movie.id, mediaType]);

  const sizeClasses = {
    sm: 'min-w-[130px] w-[130px] sm:min-w-[150px] sm:w-[150px]',
    md: 'min-w-[155px] w-[155px] sm:min-w-[175px] sm:w-[175px] lg:min-w-[200px] lg:w-[200px]',
    lg: 'min-w-[190px] w-[190px] sm:min-w-[220px] sm:w-[220px] lg:min-w-[260px] lg:w-[260px]',
  };

  return (
    <Link
      href={`/${mediaType}/${movie.id}`}
      className={`${sizeClasses[size]} flex-shrink-0 group/card`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-bg-tertiary transition-all duration-400 group-hover/card:scale-[1.03] group-hover/card:shadow-2xl group-hover/card:shadow-black/40">
        <Image
          src={getImageUrl(movie.poster_path, 'w342')}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 155px, (max-width: 1024px) 175px, 200px"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <p className="text-white text-sm font-semibold line-clamp-2 mb-1.5">{title}</p>
          <div className="flex items-center gap-2 text-xs text-white/70">
            {rating && parseFloat(rating) > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            )}
            {year && <span>{year}</span>}
          </div>
          {/* Play button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-300 border border-white/20">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Watched badge */}
        {watched && (
          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-accent-red rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}
