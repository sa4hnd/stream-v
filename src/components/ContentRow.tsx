'use client';

import { useRef, useState } from 'react';
import ContentCard from './ContentCard';
import { Movie } from '@/types';

interface ContentRowProps {
  title: string;
  movies: Movie[];
  type?: 'movie' | 'tv';
}

export default function ContentRow({ title, movies, type }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!movies?.length) return null;

  return (
    <div className="relative group/row mb-10 lg:mb-14">
      {/* Section Title */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 px-6 sm:px-8 lg:px-14">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-black/80 border border-white/10"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Cards */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-6 sm:px-8 lg:px-14 py-1"
        >
          {movies.map((movie, index) => (
            <ContentCard
              key={movie.id}
              movie={movie}
              type={type || (movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie')}
              index={index}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-black/80 border border-white/10"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
