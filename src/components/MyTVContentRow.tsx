'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { MyTVMovie, MyTVSeries } from '@/types';

function MyTVCard({ item, href }: { item: { title: string; poster: string; year: string; rating: string; category: string }; href: string }) {
  return (
    <Link
      href={href}
      className="min-w-[155px] w-[155px] sm:min-w-[175px] sm:w-[175px] lg:min-w-[200px] lg:w-[200px] flex-shrink-0 group/card"
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-bg-tertiary transition-all duration-400 group-hover/card:scale-[1.03] group-hover/card:shadow-2xl group-hover/card:shadow-black/40">
        {item.poster ? (
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/[0.04]">
            <span className="text-2xl font-bold text-white/20">{item.title.slice(0, 2)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <p className="text-white text-sm font-semibold line-clamp-2 mb-1.5">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-white/70">
            {item.rating && (
              <span className="flex items-center gap-1 text-yellow-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {item.rating}
              </span>
            )}
            {item.year && <span>{item.year}</span>}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-75 group-hover/card:scale-100 transition-transform duration-300 border border-white/20">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MyTVRow({ title, children }: { title: string; children: React.ReactNode }) {
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
    rowRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/row mb-10 lg:mb-14">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 px-6 sm:px-8 lg:px-14">
        {title}
      </h2>
      <div className="relative">
        {showLeft && (
          <button onClick={() => scroll('left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-black/80 border border-white/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <div ref={rowRef} onScroll={handleScroll} className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-6 sm:px-8 lg:px-14 py-1">
          {children}
        </div>
        {showRight && (
          <button onClick={() => scroll('right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:bg-black/80 border border-white/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function MyTVMovieRow({ title, movies }: { title: string; movies: MyTVMovie[] }) {
  if (!movies?.length) return null;
  return (
    <MyTVRow title={title}>
      {movies.map((m) => (
        <MyTVCard key={m.id} item={m} href={`/mytv/movie/${m.id}`} />
      ))}
    </MyTVRow>
  );
}

export function MyTVSeriesRow({ title, series }: { title: string; series: MyTVSeries[] }) {
  if (!series?.length) return null;
  return (
    <MyTVRow title={title}>
      {series.map((s) => (
        <MyTVCard key={s.id} item={s} href={`/mytv/series/${s.id}`} />
      ))}
    </MyTVRow>
  );
}
