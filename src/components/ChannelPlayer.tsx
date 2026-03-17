'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { Channel } from '@/types';
import { isFavoriteChannel, toggleFavoriteChannel } from '@/lib/channelFavorites';

// Proxy all HLS requests through our API to avoid CORS
const proxyUrl = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`;

interface Props {
  channelId: string;
  allChannels: Channel[];
}

export default function ChannelPlayer({ channelId, allChannels }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout>();
  const stripRef = useRef<HTMLDivElement>(null);

  const [currentChannel, setCurrentChannel] = useState<Channel | null>(
    allChannels.find((c) => c.id === channelId) || null
  );
  const [showControls, setShowControls] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom HLS.js loader that proxies all requests
  const getProxyLoader = useCallback(() => {
    const DefaultLoader = Hls.DefaultConfig.loader;

    class ProxyLoader extends (DefaultLoader as any) {
      constructor(config: any) {
        super(config);
        const originalLoad = this.load.bind(this);
        this.load = (context: any, config: any, callbacks: any) => {
          // Rewrite URL to go through our proxy
          if (context.url && !context.url.startsWith('/api/proxy')) {
            context.url = proxyUrl(context.url);
          }
          originalLoad(context, config, callbacks);
        };
      }
    }
    return ProxyLoader as any;
  }, []);

  // Load channel stream
  const loadStream = useCallback((channel: Channel) => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(false);

    // Cleanup previous
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = channel.stream_url;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        loader: getProxyLoader(),
      });
      hlsRef.current = hls;
      // Load through proxy
      hls.loadSource(proxyUrl(url));
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          // Try to recover
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError(true);
            setLoading(false);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS — proxy the URL
      video.src = proxyUrl(url);
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        setError(true);
        setLoading(false);
      }, { once: true });
    } else {
      setError(true);
      setLoading(false);
    }
  }, [getProxyLoader]);

  // Init
  useEffect(() => {
    if (currentChannel) {
      loadStream(currentChannel);
      setIsFav(isFavoriteChannel(currentChannel.id));
    }
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [currentChannel, loadStream]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 5000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [resetHideTimer]);

  const toggleControls = () => {
    if (showControls) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setShowControls(false);
    } else {
      resetHideTimer();
    }
  };

  const togglePause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.play();
    } else {
      video.pause();
    }
    setPaused(!paused);
    resetHideTimer();
  };

  const switchChannel = (ch: Channel) => {
    setCurrentChannel(ch);
    setPaused(false);
    resetHideTimer();
    window.history.replaceState(null, '', `/channel/${ch.id}`);
    setTimeout(() => {
      const el = document.getElementById(`ch-strip-${ch.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 100);
  };

  const toggleFav = () => {
    if (!currentChannel) return;
    const nowFav = toggleFavoriteChannel(currentChannel.id);
    setIsFav(nowFav);
  };

  if (!currentChannel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Channel not found</p>
          <button onClick={() => router.push('/channels')} className="text-accent-red hover:underline text-sm">
            Browse Channels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Player Area */}
      <div
        className="relative flex-1 flex items-center justify-center cursor-pointer select-none"
        onClick={toggleControls}
        style={{ minHeight: '100vh' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain absolute inset-0"
          playsInline
          autoPlay
          muted={false}
        />

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin" />
              </div>
              <p className="text-white/50 text-sm">Loading {currentChannel.name}...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-white/60 text-lg mb-2">Stream unavailable</p>
              <p className="text-white/30 text-sm mb-4">{currentChannel.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadStream(currentChannel);
                }}
                className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-0 z-20 flex flex-col justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/70 to-transparent">
            <button
              onClick={() => router.push('/channels')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm hidden sm:inline">Channels</span>
            </button>

            <h1 className="text-white font-semibold text-base sm:text-lg truncate max-w-[50%]">
              {currentChannel.name}
            </h1>

            <button
              onClick={toggleFav}
              className="p-2 transition-colors"
            >
              <svg
                className={`w-5 h-5 ${isFav ? 'text-accent-red fill-accent-red' : 'text-white/60 hover:text-white'}`}
                fill={isFav ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* Center Play/Pause */}
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePause();
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all active:scale-90"
            >
              {paused ? (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Channel Strip */}
          <div className="bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 sm:pb-6 px-2">
            <div className="flex items-center gap-2 mb-3 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] text-white/40 font-medium">LIVE</span>
            </div>
            <div
              ref={stripRef}
              className="flex gap-2.5 overflow-x-auto hide-scrollbar px-4 pb-2"
            >
              {allChannels.map((ch) => {
                const isActive = ch.id === currentChannel.id;
                return (
                  <button
                    key={ch.id}
                    id={`ch-strip-${ch.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      switchChannel(ch);
                    }}
                    className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-accent-red bg-white/10'
                        : 'border-transparent bg-white/[0.08] hover:bg-white/[0.15]'
                    }`}
                  >
                    {ch.logo ? (
                      <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/40">
                        {ch.name.slice(0, 2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
