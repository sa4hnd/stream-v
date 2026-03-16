'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Season, Episode, SeasonDetail } from '@/types';
import { isWatched, getProgress } from '@/lib/history';

interface EpisodeSidebarProps {
  tvId: number;
  currentSeason: number;
  currentEpisode: number;
  seasons: Season[];
  showTitle: string;
}

export default function EpisodeSidebar({ tvId, currentSeason, currentEpisode, seasons }: EpisodeSidebarProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoNext, setAutoNext] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/season?tvId=${tvId}&season=${selectedSeason}`)
      .then((r) => r.json())
      .then((data: SeasonDetail) => {
        setEpisodes(data.episodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tvId, selectedSeason]);

  // Auto scroll to current episode
  useEffect(() => {
    if (!loading) {
      const el = document.getElementById(`ep-${currentSeason}-${currentEpisode}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, currentSeason, currentEpisode]);

  const getImageUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w300${path}` : null;

  const nextEpisode = episodes.find((ep) => ep.episode_number === currentEpisode + 1);
  const nextSeasonExists = validSeasons.some((s) => s.season_number === currentSeason + 1);

  // Auto-next navigation hint
  const getAutoNextTarget = () => {
    if (nextEpisode) {
      return `/watch/tv/${tvId}?s=${currentSeason}&e=${currentEpisode + 1}`;
    }
    if (nextSeasonExists) {
      return `/watch/tv/${tvId}?s=${currentSeason + 1}&e=1`;
    }
    return null;
  };

  const autoNextTarget = getAutoNextTarget();

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Episodes</h3>
          {/* Auto-next toggle */}
          <button
            onClick={() => setAutoNext(!autoNext)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
              autoNext
                ? 'bg-accent-red/20 text-accent-red'
                : 'bg-white/5 text-white/30'
            }`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Auto
          </button>
        </div>

        {/* Season Selector */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {validSeasons.map((s) => (
            <button
              key={s.season_number}
              onClick={() => setSelectedSeason(s.season_number)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSeason === s.season_number
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
              }`}
            >
              S{s.season_number}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-next banner */}
      {autoNext && autoNextTarget && selectedSeason === currentSeason && (
        <div className="px-4 py-2.5 bg-accent-red/10 border-b border-accent-red/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full bg-accent-red/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <span className="text-white/60">
                Up next: <span className="text-white/80 font-medium">E{nextEpisode ? currentEpisode + 1 : '1'}</span>
              </span>
            </div>
            <Link
              href={autoNextTarget}
              className="text-[11px] font-semibold text-accent-red hover:text-accent-red-hover transition-colors"
            >
              Play Now
            </Link>
          </div>
        </div>
      )}

      {/* Episode List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar max-h-[500px] xl:max-h-none">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-28 aspect-video rounded-lg shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-3/4 shimmer rounded" />
                  <div className="h-2 w-1/2 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2">
            {episodes.map((ep) => {
              const isActive = selectedSeason === currentSeason && ep.episode_number === currentEpisode;
              const thumb = getImageUrl(ep.still_path);
              const watched = isWatched(tvId, 'tv', selectedSeason, ep.episode_number);
              const epProgress = getProgress(tvId, 'tv', selectedSeason, ep.episode_number);

              return (
                <Link
                  key={ep.id}
                  id={`ep-${selectedSeason}-${ep.episode_number}`}
                  href={`/watch/tv/${tvId}?s=${ep.season_number}&e=${ep.episode_number}`}
                  className={`flex gap-3 p-2 rounded-xl transition-all duration-200 group/ep mb-0.5 ${
                    isActive
                      ? 'bg-white/[0.06] ring-1 ring-white/10'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={ep.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                    {/* Playing indicator */}
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          <div className="w-0.5 h-3 bg-accent-red rounded-full animate-pulse" />
                          <div className="w-0.5 h-4 bg-accent-red rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                          <div className="w-0.5 h-2.5 bg-accent-red rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                        </div>
                      </div>
                    )}
                    {/* Hover play */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/ep:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                    {/* Duration badge */}
                    {ep.runtime > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white/70 px-1 py-0.5 rounded">
                        {ep.runtime}m
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start gap-1 mb-0.5">
                      {watched ? (
                        <svg className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-[11px] font-bold flex-shrink-0 ${isActive ? 'text-accent-red' : 'text-white/25'}`}>
                          {ep.episode_number}.
                        </span>
                      )}
                      <p className={`text-xs font-medium line-clamp-1 ${isActive ? 'text-white' : watched ? 'text-white/30' : 'text-white/60 group-hover/ep:text-white/80'} transition-colors`}>
                        {ep.name}
                      </p>
                    </div>
                    {/* Progress bar for partially watched */}
                    {epProgress > 0 && epProgress < 100 && (
                      <div className="w-full h-0.5 bg-white/5 rounded-full mb-1 mt-0.5">
                        <div className="h-full bg-accent-red rounded-full" style={{ width: `${epProgress}%` }} />
                      </div>
                    )}
                    <p className="text-[11px] text-white/25 line-clamp-2 leading-relaxed">{ep.overview}</p>
                    {ep.vote_average > 0 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <svg className="w-2.5 h-2.5 text-yellow-500/60" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[10px] text-white/25">{ep.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
