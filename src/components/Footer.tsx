import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.03]">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="max-w-[240px]">
            <svg viewBox="0 0 110 30" className="h-5 mb-3" fill="none">
              <rect x="0" y="2" width="24" height="24" rx="6" fill="#E50914" />
              <polygon points="9.5,8 9.5,20 19,14" fill="white" />
              <text x="30" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="700" fill="white" letterSpacing="0.5">Stream</text>
              <text x="86" y="21" fontFamily="system-ui, -apple-system, sans-serif" fontSize="19" fontWeight="700" fill="#E50914" letterSpacing="0.5">V</text>
            </svg>
            <p className="text-white/20 text-xs leading-relaxed">
              Stream unlimited movies and TV shows.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16 text-sm">
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold tracking-widest text-white/20 uppercase">Browse</h4>
              <Link href="/movies" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Movies</Link>
              <Link href="/tv" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Series</Link>
              <Link href="/search" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Search</Link>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold tracking-widest text-white/20 uppercase">Genres</h4>
              <Link href="/genre/28" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Action</Link>
              <Link href="/genre/35" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Comedy</Link>
              <Link href="/genre/27" className="block text-white/30 hover:text-white/70 transition-colors text-sm">Horror</Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.03] text-center">
          <p className="text-white/10 text-[11px]">
            Data provided by TMDB. Not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
