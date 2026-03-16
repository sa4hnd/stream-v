'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { streamingSources } from '@/lib/sources';
import { addToHistory, markAsWatched, updateProgress } from '@/lib/history';

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
  runtime?: number; // in minutes
  nextEpisodeUrl?: string | null;
  nextEpisodeLabel?: string; // e.g. "S1 E3"
  autoNext?: boolean;
}

export default function VideoPlayer({
  type, id, season, episode, title, backdrop, posterPath, overview, voteAverage,
  runtime, nextEpisodeUrl, nextEpisodeLabel, autoNext = true,
}: VideoPlayerProps) {
  const router = useRouter();
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [failedSources, setFailedSources] = useState<Set<number>>(new Set());
  const [autoTrying, setAutoTrying] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const watchTimerRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const elapsedRef = useRef(0);

  const currentSource = streamingSources[sourceIndex];
  const embedUrl = currentSource.getUrl(type, id, season, episode);

  // Total duration in seconds (use runtime or default 45min for TV, 120min for movies)
  const totalSeconds = (runtime || (type === 'tv' ? 45 : 120)) * 60;
  // Trigger "next episode" button 2 minutes before end
  const triggerAt = Math.max(totalSeconds - 120, totalSeconds * 0.85);

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
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [id, type, season, episode, title, posterPath, backdrop, voteAverage, overview]);

  // Progress tracking timer - starts when iframe loads
  useEffect(() => {
    if (isLoading || autoTrying) return;

    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds(elapsedRef.current);

      // Update progress in localStorage every 30 seconds
      if (elapsedRef.current % 30 === 0) {
        const progress = Math.min(Math.round((elapsedRef.current / totalSeconds) * 100), 100);
        updateProgress(id, type, progress, season, episode);
      }

      // Show "Next Episode" button when near end
      if (nextEpisodeUrl && elapsedRef.current >= triggerAt && !hasNavigated) {
        setShowNextButton(true);
        const remaining = totalSeconds - elapsedRef.current;
        setCountdown(Math.max(0, Math.ceil(remaining)));
      }

      // Auto-navigate when done
      if (elapsedRef.current >= totalSeconds && !hasNavigated) {
        markAsWatched(id, type, season, episode);
        if (autoNext && nextEpisodeUrl) {
          setHasNavigated(true);
          router.push(nextEpisodeUrl);
        }
      }
    }, 1000);

    progressIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isLoading, autoTrying, totalSeconds, triggerAt, nextEpisodeUrl, autoNext, hasNavigated, id, type, season, episode, router]);

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
    setFailedSources(new Set());
    setSourceIndex(i);
    setIsLoading(true);
    setAutoTrying(false);
  };

  const startAutoTry = () => {
    setAutoTrying(true);
    tryNextSource();
  };

  const handleNextEpisode = () => {
    if (nextEpisodeUrl && !hasNavigated) {
      markAsWatched(id, type, season, episode);
      setHasNavigated(true);
      router.push(nextEpisodeUrl);
    }
  };

  const progressPercent = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

        {/* Next Episode Overlay */}
        {showNextButton && nextEpisodeUrl && !hasNavigated && (
          <div className="absolute bottom-0 left-0 right-0 z-20 animate-slide-up">
            {/* Gradient backdrop */}
            <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Countdown ring */}
                  {autoNext && countdown > 0 && (
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
                        <circle
                          cx="18" cy="18" r="16" fill="none" stroke="#e50914" strokeWidth="2"
                          strokeDasharray={`${(countdown / 120) * 100.53} 100.53`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
                        {countdown}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white/50 text-[11px] font-medium uppercase tracking-wider">
                      {autoNext ? 'Up next' : 'Next episode'}
                    </p>
                    <p className="text-white text-sm font-semibold truncate">
                      {nextEpisodeLabel || 'Next Episode'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {autoNext && (
                    <button
                      onClick={() => setShowNextButton(false)}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleNextEpisode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-white/90 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                    </svg>
                    Play Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar at bottom of player */}
        {!isLoading && elapsedSeconds > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-10">
            <div
              className="h-full bg-accent-red transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Server Bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-medium text-white/40">
              {currentSource.name}
            </span>
            {/* Elapsed time */}
            {!isLoading && elapsedSeconds > 10 && (
              <span className="text-[10px] text-white/20">
                {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
              </span>
            )}
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
