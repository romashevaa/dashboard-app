/**
 * Shown instantly while a section's server component streams in, so navigating
 * between categories gives immediate feedback instead of a blank pause.
 */
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center gap-3">
        <div className="size-10 rounded-lg bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-3 w-56 rounded bg-white/5" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
