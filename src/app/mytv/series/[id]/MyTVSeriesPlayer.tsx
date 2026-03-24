'use client';

import { useState, useCallback } from 'react';
import MyTVPlayer from '@/components/MyTVPlayer';
import { MyTVSeries } from '@/types';

interface Props {
  serie: MyTVSeries;
}

export default function MyTVSeriesPlayer({ serie }: Props) {
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  const seasons = serie.seasons;
  const currentSeason = seasons[selectedSeason];
  const episodes = currentSeason?.episodes || [];
  const currentEpisode = episodes[selectedEpisode];
  const streamUrl = currentEpisode?.stream_url || serie.stream_url || '';

  const handleNext = useCallback(() => {
    if (selectedEpisode < episodes.length - 1) {
      setSelectedEpisode(selectedEpisode + 1);
    } else if (selectedSeason < seasons.length - 1) {
      setSelectedSeason(selectedSeason + 1);
      setSelectedEpisode(0);
    }
  }, [selectedEpisode, selectedSeason, episodes.length, seasons.length]);

  if (!streamUrl && seasons.length === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-white/[0.04] flex items-center justify-center">
        <p className="text-white/30">No episodes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player */}
      {streamUrl ? (
        <MyTVPlayer
          key={streamUrl}
          streamUrl={streamUrl}
          title={currentEpisode ? `${serie.title} - ${currentEpisode.title}` : serie.title}
          poster={serie.backdrop || serie.poster}
          onEnded={handleNext}
        />
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-white/[0.04] flex items-center justify-center">
          <p className="text-white/30">Select an episode to play</p>
        </div>
      )}

      {/* Season selector */}
      {seasons.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {seasons.map((season, i) => (
            <button
              key={i}
              onClick={() => { setSelectedSeason(i); setSelectedEpisode(0); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === selectedSeason
                  ? 'bg-white text-black'
                  : 'bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.07]'
              }`}
            >
              {season.title}
            </button>
          ))}
        </div>
      )}

      {/* Episode list */}
      {episodes.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium text-white/60">
              {currentSeason?.title || 'Episodes'} &middot; {episodes.length} episode{episodes.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {episodes.map((ep, i) => (
              <button
                key={i}
                onClick={() => setSelectedEpisode(i)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/[0.04] ${
                  i === selectedEpisode ? 'bg-white/[0.06]' : ''
                } ${i < episodes.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  {i === selectedEpisode ? (
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white/30 font-medium">{ep.episode_number}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${i === selectedEpisode ? 'text-white' : 'text-white/60'}`}>
                    {ep.title}
                  </p>
                  {ep.duration && (
                    <p className="text-[10px] text-white/20 mt-0.5">{ep.duration}</p>
                  )}
                </div>
                {!ep.stream_url && (
                  <span className="text-[10px] text-white/10">No stream</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
