'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLastWatchedEpisode } from '@/lib/history';
import { SeasonDetail } from '@/types';

interface SmartWatchButtonProps {
  tvId: number;
  totalSeasons?: number;
}

export default function SmartWatchButton({ tvId, totalSeasons }: SmartWatchButtonProps) {
  const [href, setHref] = useState(`/watch/tv/${tvId}?s=1&e=1`);
  const [label, setLabel] = useState('Watch S1 E1');

  useEffect(() => {
    const resolve = async () => {
      const last = getLastWatchedEpisode(tvId);
      if (!last) return;

      // Not finished → resume exactly where they left off
      if (!last.completed) {
        setHref(`/watch/tv/${tvId}?s=${last.season}&e=${last.episode}`);
        setLabel(`Resume S${last.season} E${last.episode}`);
        return;
      }

      // Finished → find the next episode
      try {
        const res = await fetch(`/api/season?tvId=${tvId}&season=${last.season}`);
        const data: SeasonDetail = await res.json();
        const episodes = data.episodes || [];
        const nextEp = episodes.find((ep) => ep.episode_number === last.episode + 1);

        if (nextEp) {
          setHref(`/watch/tv/${tvId}?s=${last.season}&e=${nextEp.episode_number}`);
          setLabel(`Watch S${last.season} E${nextEp.episode_number}`);
        } else if (totalSeasons && last.season < totalSeasons) {
          // Next season
          setHref(`/watch/tv/${tvId}?s=${last.season + 1}&e=1`);
          setLabel(`Watch S${last.season + 1} E1`);
        } else {
          // Finished the whole show, just show watch from start
          setHref(`/watch/tv/${tvId}?s=1&e=1`);
          setLabel('Rewatch S1 E1');
        }
      } catch {
        // Fallback to the completed episode
        setHref(`/watch/tv/${tvId}?s=${last.season}&e=${last.episode}`);
        setLabel(`Watch S${last.season} E${last.episode}`);
      }
    };

    resolve();
  }, [tvId, totalSeasons]);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 bg-white text-black font-semibold px-8 py-3 rounded-full transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
      {label}
    </Link>
  );
}
