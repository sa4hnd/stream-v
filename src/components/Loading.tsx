export default function Loading() {
  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-accent-red/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-red animate-spin" />
        </div>
        <span className="font-display text-2xl tracking-wider text-text-secondary">
          LOADING
        </span>
      </div>
    </div>
  );
}
