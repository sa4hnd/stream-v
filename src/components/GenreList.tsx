'use client';

import { Genre } from '@/types';
import Link from 'next/link';

interface GenreListProps {
  genres: Genre[];
  activeGenreId?: number;
}

export default function GenreList({ genres, activeGenreId }: GenreListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/genre/${genre.id}`}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            activeGenreId === genre.id
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
          }`}
        >
          {genre.name}
        </Link>
      ))}
    </div>
  );
}
