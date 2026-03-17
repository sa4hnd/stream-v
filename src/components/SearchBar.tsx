'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, Channel } from '@/types';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [channelResults, setChannelResults] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch channels once for local search
  useEffect(() => {
    fetch('https://sahnd-plus-api.vercel.app/api/channels')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.categories) {
          const flat = data.categories.flatMap((c: any) => c.channels);
          setAllChannels(flat);
        }
      })
      .catch(() => {});
  }, []);

  const searchTMDB = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=3ea9ba88a81be0f283362871b7f6b19e&query=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      const filtered = (data.results || [])
        .filter((r: Movie) => r.media_type !== 'person' && (r.poster_path || r.backdrop_path))
        .slice(0, 8);
      setResults(filtered);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    // Filter channels locally
    if (value.trim()) {
      const q = value.toLowerCase();
      setChannelResults(allChannels.filter((ch) => ch.name.toLowerCase().includes(q)).slice(0, 5));
    } else {
      setChannelResults([]);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchTMDB(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setResults([]);
      setQuery('');
    }
  };

  const getImageUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w92${path}` : '/no-poster.svg';

  return (
    <div ref={containerRef} className="relative">
      {isOpen ? (
        <div className="animate-scale-in">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search movies, TV shows..."
              className="w-56 sm:w-72 lg:w-96 bg-bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>

          {/* Live Results Dropdown */}
          {(results.length > 0 || channelResults.length > 0 || (loading && query)) && (
            <div className="absolute top-full mt-2 w-full glass-heavy rounded-xl overflow-hidden shadow-2xl shadow-black/50 max-h-[70vh] overflow-y-auto z-50">
              {/* Channel Results */}
              {channelResults.length > 0 && (
                <>
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 border-b border-white/5">
                    Channels
                  </div>
                  {channelResults.map((ch) => (
                    <Link
                      key={`ch-${ch.id}`}
                      href={`/channel/${ch.id}`}
                      onClick={() => { setIsOpen(false); setResults([]); setChannelResults([]); setQuery(''); }}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                        {ch.logo ? (
                          <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-xs font-bold text-white/30">{ch.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{ch.name}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                          <span>{ch.category}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {/* Media Results */}
              {loading ? (
                <div className="p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
                  <span className="text-text-muted text-sm">Searching...</span>
                </div>
              ) : (
                <>
                  {results.map((item) => {
                    const title = item.title || item.name || '';
                    const type = item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie';
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);

                    return (
                      <Link
                        key={`${type}-${item.id}`}
                        href={`/${type}/${item.id}`}
                        onClick={() => { setIsOpen(false); setResults([]); setQuery(''); }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-bg-tertiary">
                          <Image
                            src={getImageUrl(item.poster_path)}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{title}</p>
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-medium">
                              {type}
                            </span>
                            {year && <span>{year}</span>}
                            {item.vote_average > 0 && (
                              <span className="text-accent-red flex items-center gap-0.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                  {query && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => { setIsOpen(false); setResults([]); setQuery(''); }}
                      className="flex items-center justify-center gap-2 p-3 text-accent-red text-sm hover:bg-white/5 transition-colors"
                    >
                      View all results for &ldquo;{query}&rdquo;
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-text-secondary hover:text-white transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      )}
    </div>
  );
}
