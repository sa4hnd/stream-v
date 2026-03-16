'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WatchlistItem } from '@/types';
import { getWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { getImageUrl } from '@/lib/tmdb';

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getWatchlist().sort((a, b) => b.addedAt - a.addedAt));
    setMounted(true);
  }, []);

  const handleRemove = (id: number, type: 'movie' | 'tv') => {
    removeFromWatchlist(id, type);
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  if (!mounted) {
    return (
      <div className="pt-24 lg:pt-28 min-h-screen">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="h-12 w-48 shimmer rounded-lg mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28 page-enter min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">My List</h1>
        <p className="text-white/30 text-sm mb-10">{items.length} title{items.length !== 1 ? 's' : ''} saved</p>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="group/wl relative">
                <Link href={`/${item.type}/${item.id}`}>
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 transition-all duration-300 group-hover/wl:scale-[1.03] group-hover/wl:shadow-2xl">
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(item.poster_path)}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/wl:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-card-gradient opacity-0 group-hover/wl:opacity-100 transition-opacity duration-300" />
                      {/* Rating */}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-accent-red px-1.5 py-0.5 rounded">
                        {item.vote_average.toFixed(1)}
                      </div>
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white px-1.5 py-0.5 rounded uppercase">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                    </div>
                  </div>
                </Link>
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id, item.type)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover/wl:opacity-100 transition-opacity hover:bg-accent-red"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <p className="font-display text-2xl tracking-wider text-text-secondary mb-2">YOUR LIST IS EMPTY</p>
            <p className="text-text-muted text-sm mb-8">Start adding movies and shows to keep track of what you want to watch.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red-hover text-white font-medium px-6 py-3 rounded-lg transition-all"
            >
              Browse Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
