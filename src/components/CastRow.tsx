import Image from 'next/image';
import { CastMember } from '@/types';
import { getImageUrl } from '@/lib/tmdb';

interface CastRowProps {
  cast: CastMember[];
}

export default function CastRow({ cast }: CastRowProps) {
  if (!cast?.length) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-white/60 mb-4">Cast</h3>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {cast.slice(0, 15).map((member) => (
          <div key={member.id} className="flex-shrink-0 w-16 group/cast">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2 ring-2 ring-transparent group-hover/cast:ring-white/20 transition-all">
              <Image
                src={getImageUrl(member.profile_path, 'w185')}
                alt={member.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <p className="text-[11px] text-white/60 text-center truncate">{member.name}</p>
            <p className="text-[10px] text-white/20 text-center truncate">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
