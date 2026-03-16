'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLastWatchedEpisode } from '@/lib/history';

interface SmartWatchButtonProps {
  tvId: number;
}

export default function SmartWatchButton({ tvId }: SmartWatchButtonProps) {
  const [href, setHref] = useState(`/watch/tv/${tvId}?s=1&e=1`);
  const [label, setLabel] = useState('Watch S1 E1');

  useEffect(() => {
    const last = getLastWatchedEpisode(tvId);
    if (last) {
      setHref(`/watch/tv/${tvId}?s=${last.season}&e=${last.episode}`);
      setLabel(`Resume S${last.season} E${last.episode}`);
    }
  }, [tvId]);

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
