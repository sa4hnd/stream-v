'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Season, Episode, SeasonDetail } from '@/types';
import { useState, useEffect } from 'react';

interface SeasonSelectorProps {
  tvId: number;
  seasons: Season[];
}

export default function SeasonSelector({ tvId, seasons }: SeasonSelectorProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [selectedSeason, setSelectedSeason] = useState(validSeasons[0]?.season_number || 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <h3 className="text-sm font-semibold text-white/60">Episodes</h3>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {validSeasons.map((season) => (
            <button
              key={season.season_number}
              onClick={() => setSelectedSeason(season.season_number)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedSeason === season.season_number
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              Season {season.season_number}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/tv/${tvId}?s=${ep.season_number}&e=${ep.episode_number}`}
              className="flex gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all group/ep border border-transparent hover:border-white/5"
            >
              <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                {ep.still_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white/10" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/ep:opacity-100 transition-opacity">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 py-0.5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white/70 group-hover/ep:text-white transition-colors">
                    <span className="text-white/25">{ep.episode_number}.</span>{' '}
                    {ep.name}
                  </h4>
                  {ep.runtime > 0 && (
                    <span className="text-[11px] text-white/20 flex-shrink-0">{ep.runtime}m</span>
                  )}
                </div>
                <p className="text-xs text-white/25 line-clamp-2 leading-relaxed">{ep.overview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
