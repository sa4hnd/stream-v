'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLastWatchedEpisode, getProgress } from '@/lib/history';

interface ResumeShowButtonProps {
  tvId: number;
}

export default function ResumeShowButton({ tvId }: ResumeShowButtonProps) {
  const [resumeData, setResumeData] = useState<{ season: number; episode: number; progress: number } | null>(null);

  useEffect(() => {
    const last = getLastWatchedEpisode(tvId);
    if (last) {
      const progress = getProgress(tvId, 'tv', last.season, last.episode);
      setResumeData({ ...last, progress });
    }
  }, [tvId]);

  if (!resumeData) return null;

  return (
    <Link
      href={`/watch/tv/${tvId}?s=${resumeData.season}&e=${resumeData.episode}`}
      className="inline-flex items-center gap-2.5 bg-accent-red text-white font-semibold px-8 py-3 rounded-full transition-all hover:bg-accent-red-hover hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
    >
      {/* Progress fill */}
      {resumeData.progress > 0 && resumeData.progress < 100 && (
        <div
          className="absolute inset-0 bg-white/10"
          style={{ width: `${resumeData.progress}%` }}
        />
      )}
      <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
      <span className="relative z-10">
        Resume S{resumeData.season} E{resumeData.episode}
      </span>
    </Link>
  );
}
