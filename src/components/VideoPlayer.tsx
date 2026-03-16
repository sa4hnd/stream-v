'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { streamingSources } from '@/lib/sources';
import { addToHistory, markAsWatched } from '@/lib/history';

interface VideoPlayerProps {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  title?: string;
  backdrop?: string | null;
  posterPath?: string | null;
  overview?: string;
  voteAverage?: number;
}

export default function VideoPlayer({ type, id, season, episode, title, backdrop, posterPath, overview, voteAverage }: VideoPlayerProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [failedSources, setFailedSources] = useState<Set<number>>(new Set());
  const [autoTrying, setAutoTrying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const watchTimerRef = useRef<NodeJS.Timeout>();

  const currentSource = streamingSources[sourceIndex];
  const embedUrl = currentSource.getUrl(type, id, season, episode);

  // Record to watch history on mount
  useEffect(() => {
    addToHistory({
      id, type, title: title || '',
      poster_path: posterPath || null,
      backdrop_path: backdrop ? backdrop.replace('https://image.tmdb.org/t/p/original', '') : null,
      vote_average: voteAverage || 0,
      overview: overview || '',
      season, episode,
    });

    // After 5 minutes, mark as watched
    watchTimerRef.current = setTimeout(() => {
      markAsWatched(id, type, season, episode);
    }, 300000);

    return () => {
      if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    };
  }, [id, type, season, episode, title, posterPath, backdrop, voteAverage, overview]);

  const tryNextSource = useCallback(() => {
    const nextIndex = sourceIndex + 1;
    if (nextIndex < streamingSources.length && !failedSources.has(nextIndex)) {
      setAutoTrying(true);
      setFailedSources((prev) => new Set(prev).add(sourceIndex));
      setSourceIndex(nextIndex);
      setIsLoading(true);
    } else {
      setAutoTrying(false);
      setIsLoading(false);
    }
  }, [sourceIndex, failedSources]);

  // Auto-fallback timeout - 8 seconds
  useEffect(() => {
    if (isLoading && autoTrying) {
      timeoutRef.current = setTimeout(() => {
        tryNextSource();
      }, 8000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, autoTrying, tryNextSource]);

  const handleLoad = () => {
    setIsLoading(false);
    setAutoTrying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const stopAutoTry = () => {
    setAutoTrying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSourceChange = (i: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFailedSources(new Set()); // Reset failed sources when manually switching
    setSourceIndex(i);
    setIsLoading(true);
    setAutoTrying(false);
  };

  const startAutoTry = () => {
    setAutoTrying(true);
    tryNextSource();
  };

  return (
    <div className="w-full space-y-3">
      {/* Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/[0.04]">
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              backgroundImage: backdrop ? `url(${backdrop})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium mb-0.5">
                  {autoTrying ? 'Trying servers...' : 'Connecting...'}
                </p>
                <p className="text-white/30 text-xs">{currentSource.name}</p>
              </div>
              {autoTrying && (
                <button
                  onClick={stopAutoTry}
                  className="mt-1 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/60 hover:bg-white/15 hover:text-white transition-all"
                >
                  Stop &middot; Stay on this server
                </button>
              )}
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="origin"
          onLoad={handleLoad}
          onError={() => autoTrying && tryNextSource()}
          title={title || 'Video Player'}
          style={{ border: 'none' }}
        />
      </div>

      {/* Server Bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-medium text-white/40">
              {currentSource.name}
            </span>
          </div>
          {!autoTrying && !isLoading && (
            <button
              onClick={startAutoTry}
              className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
            >
              Not working? Try auto-switch
            </button>
          )}
          {autoTrying && (
            <button
              onClick={stopAutoTry}
              className="text-[11px] text-accent-red hover:text-accent-red-hover transition-colors font-medium"
            >
              Stop auto-switching
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {streamingSources.map((source, i) => {
            const isFailed = failedSources.has(i);
            const isActive = i === sourceIndex;
            return (
              <button
                key={source.name}
                onClick={() => handleSourceChange(i)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black'
                    : isFailed
                    ? 'bg-white/[0.02] text-white/10 hover:bg-white/[0.04] hover:text-white/20'
                    : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50'
                }`}
              >
                {isActive && !isLoading && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {isActive && isLoading && <div className="w-3 h-3 border-[1.5px] border-black/20 border-t-black rounded-full animate-spin" />}
                {source.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
