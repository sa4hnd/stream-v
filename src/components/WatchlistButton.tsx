'use client';

import { useState, useEffect } from 'react';
import { WatchlistItem } from '@/types';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist';

interface WatchlistButtonProps {
  item: WatchlistItem;
  variant?: 'icon' | 'button';
}

export default function WatchlistButton({ item, variant = 'button' }: WatchlistButtonProps) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isInWatchlist(item.id, item.type));
  }, [item.id, item.type]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      removeFromWatchlist(item.id, item.type);
      setInList(false);
    } else {
      addToWatchlist({ ...item, addedAt: Date.now() });
      setInList(true);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          inList
            ? 'bg-accent-red text-white'
            : 'bg-white/10 hover:bg-white/15 text-white/60 hover:text-white backdrop-blur-md'
        }`}
        title={inList ? 'Remove from My List' : 'Add to My List'}
      >
        {inList ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
        inList
          ? 'bg-accent-red text-white hover:bg-accent-red-hover'
          : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white backdrop-blur-md'
      }`}
    >
      {inList ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          In My List
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          My List
        </>
      )}
    </button>
  );
}
