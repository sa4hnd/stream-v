'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { STREAM_API } from '@/lib/streamApi';

interface MyTVPlayerProps {
  streamUrl: string;
  title?: string;
  poster?: string;
  onEnded?: () => void;
}

export default function MyTVPlayer({ streamUrl, title, poster, onEnded }: MyTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isM3U8 = streamUrl.includes('.m3u8');
  // Proxy all streams through our API to handle CORS + mixed content (http -> https)
  const proxyUrl = `${STREAM_API}/proxy/stream.m3u8?url=${encodeURIComponent(streamUrl)}&referer=`;
  const mp4ProxyUrl = `${STREAM_API}/proxy?url=${encodeURIComponent(streamUrl)}&referer=`;

  const loadStream = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isM3U8) {
      // HLS stream — proxy through API
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(proxyUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
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
        video.src = proxyUrl;
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
    } else {
      // Direct MP4 — proxy through API to handle mixed content (http -> https)
      video.src = mp4ProxyUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {});
      }, { once: true });
      video.addEventListener('error', () => {
        setError(true);
        setLoading(false);
      }, { once: true });
    }
  }, [streamUrl, isM3U8, proxyUrl, mp4ProxyUrl]);

  useEffect(() => {
    loadStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [loadStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onEnded) return;
    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  }, [onEnded]);

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/[0.04]">
        {/* Loading */}
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{
              backgroundImage: poster ? `url(${poster})` : undefined,
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
                <p className="text-white text-sm font-medium mb-0.5">Loading stream...</p>
                <p className="text-white/30 text-xs">MyTV+{title ? ` · ${title}` : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
            <div className="text-center">
              <p className="text-white/60 text-lg mb-2">Stream unavailable</p>
              <p className="text-white/30 text-sm mb-4">{title || 'Unknown'}</p>
              <button
                onClick={loadStream}
                className="px-5 py-2.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          autoPlay
          controls
          poster={poster || undefined}
        />
      </div>

      {/* Stream info bar */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] p-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className="text-[11px] font-medium text-white/40">
            MyTV+ · {isM3U8 ? 'HLS' : 'MP4'}
          </span>
        </div>
      </div>
    </div>
  );
}
