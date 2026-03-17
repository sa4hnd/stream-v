'use client';

import Link from 'next/link';
import { Channel, ChannelCategory } from '@/types';

interface Props {
  categories: ChannelCategory[];
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link
      href={`/channel/${channel.id}`}
      className="group relative aspect-square rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.1] hover:scale-[1.03] transition-all duration-200"
    >
      {channel.logo ? (
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-[60%] h-[60%] object-contain"
          loading="lazy"
        />
      ) : (
        <span className="text-xl font-extrabold text-white/20 group-hover:text-white/40 transition-colors">
          {channel.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      {/* Hover overlay with name */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <p className="text-[10px] font-medium text-white/80 truncate w-full text-center">{channel.name}</p>
      </div>
    </Link>
  );
}

export default function ChannelGrid({ categories }: Props) {
  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.name}>
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <span>{cat.name}</span>
            <span className="text-xs text-white/20 font-normal">{cat.channels.length}</span>
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {cat.channels.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
