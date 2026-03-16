'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { WatchHistoryItem, getLastWatched, getResumeUrl, getContinueWatching } from '@/lib/history';
import { SeasonDetail } from '@/types';

// Resolve the smart URL: if not finished → same content, if finished TV → next episode
async function resolveSmartUrl(item: WatchHistoryItem): Promise<{ url: string; label: string }> {
  const baseUrl = getResumeUrl(item);

  // Not completed → resume where they left off
  if (!item.completed) {
    return { url: baseUrl, label: 'Resume' };
  }

  // Completed movie → just rewatch
  if (item.type !== 'tv' || !item.season || !item.episode) {
    return { url: baseUrl, label: 'Watch Again' };
  }

  // Completed TV episode → find next episode
  try {
    const res = await fetch(`/api/season?tvId=${item.id}&season=${item.season}`);
    const data: SeasonDetail = await res.json();
    const episodes = data.episodes || [];
    const nextEp = episodes.find((ep) => ep.episode_number === item.episode! + 1);

    if (nextEp) {
      return {
        url: `/watch/tv/${item.id}?s=${item.season}&e=${nextEp.episode_number}`,
        label: `Play S${item.season} E${nextEp.episode_number}`,
      };
    }

    // Try next season
    const nextSeason = item.season + 1;
    return {
      url: `/watch/tv/${item.id}?s=${nextSeason}&e=1`,
      label: `Play S${nextSeason} E1`,
    };
  } catch {
    return { url: baseUrl, label: 'Watch Now' };
  }
}

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  if (!items.length) return null;

  return (
    <div className="mb-10 lg:mb-14">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 px-6 sm:px-8 lg:px-14">
        Continue Watching
      </h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar px-6 sm:px-8 lg:px-14 py-1">
        {items.map((item) => {
          const imgUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
            : '/no-poster.svg';

          return (
            <Link
              key={`${item.type}-${item.id}-${item.season}-${item.episode}`}
              href={getResumeUrl(item)}
              className="min-w-[155px] w-[155px] sm:min-w-[175px] sm:w-[175px] lg:min-w-[200px] lg:w-[200px] flex-shrink-0 group/cw"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 transition-all duration-300 group-hover/cw:scale-[1.03] group-hover/cw:shadow-2xl">
                <Image src={imgUrl} alt={item.title} fill className="object-cover" sizes="200px" />
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    className="h-full bg-accent-red rounded-full transition-all"
                    style={{ width: `${Math.max(item.progress, 5)}%` }}
                  />
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/cw:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                {/* Episode badge for TV */}
                {item.type === 'tv' && item.season && item.episode && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white px-2 py-0.5 rounded-full">
                    S{item.season} E{item.episode}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/50 mt-2 truncate">{item.title}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function HeroLastWatched({ fallbackHero }: { fallbackHero: React.ReactNode }) {
  const [lastWatched, setLastWatched] = useState<WatchHistoryItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [smartUrl, setSmartUrl] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Watch Now');

  useEffect(() => {
    const init = async () => {
      const item = getLastWatched();
      setLastWatched(item);
      setMounted(true);

      if (item) {
        const resolved = await resolveSmartUrl(item);
        setSmartUrl(resolved.url);
        setButtonLabel(resolved.label);
      }
    };
    init();
  }, []);

  if (!mounted || !lastWatched) return <>{fallbackHero}</>;

  const backdrop = lastWatched.backdrop_path
    ? `https://image.tmdb.org/t/p/original${lastWatched.backdrop_path}`
    : null;

  const heroUrl = smartUrl || getResumeUrl(lastWatched);

  return (
    <div className="relative w-full h-[80vh] min-h-[550px] max-h-[800px] rounded-b-[2rem] overflow-hidden">
      {backdrop && (
        <Image src={backdrop} alt={lastWatched.title} fill priority className="object-cover object-top" sizes="100vw" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-black/20" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 w-full">
          <div className="max-w-lg animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 mb-4 text-xs text-white/70">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Continue Watching
              {lastWatched.type === 'tv' && lastWatched.season && lastWatched.episode && (
                <span className="text-white/40"> &middot; S{lastWatched.season} E{lastWatched.episode}</span>
              )}
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide leading-[0.95] mb-5">
              {lastWatched.title}
            </h1>

            <p className="text-white/60 text-sm sm:text-[15px] leading-relaxed mb-6 line-clamp-2">
              {lastWatched.overview}
            </p>

            {/* Progress indicator */}
            {lastWatched.progress > 0 && lastWatched.progress < 100 && (
              <div className="w-48 mb-5">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-red rounded-full" style={{ width: `${lastWatched.progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link
                href={heroUrl}
                className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-7 py-3 rounded-full transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                {buttonLabel}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </Link>
              <Link
                href={`/${lastWatched.type}/${lastWatched.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-7 py-3 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10"
              >
                Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
