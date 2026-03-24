import MyTVBrowse from './MyTVBrowse';

export const metadata = {
  title: 'MyTV+ - SAHND+',
  description: 'Browse movies and series from MyTV+',
};

export default function MyTVPage() {
  return (
    <div className="min-h-screen page-enter">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[320px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-bg-primary/50 to-bg-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="relative max-w-[1800px] mx-auto w-full px-6 sm:px-8 lg:px-14 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">MyTV+</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-2">MyTV+ Library</h1>
          <p className="text-white/40 text-sm">Browse movies and series</p>
        </div>
      </div>

      {/* Content — fetched client-side to avoid Vercel timeout on large responses */}
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-14 pb-16">
        <MyTVBrowse />
      </div>
    </div>
  );
}
