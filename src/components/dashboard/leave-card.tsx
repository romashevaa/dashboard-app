import { cn } from "@/lib/utils";

// Sample data — wire to a real leave-balance source when that feature lands.
const LEAVE = [
  { emoji: "😴", label: "Day off left", used: 3, total: 5 },
  { emoji: "🤒", label: "Sick leaves left", used: 1, total: 5 },
  { emoji: "🌴", label: "Vacation left", used: 10, total: 15 },
];

const pillButton =
  "shrink-0 rounded bg-white/15 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/25";

export function LeaveCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg bg-brand", className)}>
      <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {LEAVE.map((stat) => (
          <div
            key={stat.label}
            className="flex h-40 flex-col justify-between p-4"
          >
            <div className="flex items-center gap-1.5 text-white">
              <span className="text-xl leading-none" aria-hidden>
                {stat.emoji}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {stat.used}
                </span>
                <span className="text-lg font-medium text-white/50">
                  /{stat.total}
                </span>
              </p>
              <button type="button" className={pillButton}>
                Request
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 bg-background/30 px-4 py-3">
        <p className="text-sm text-white/80">
          Unused vacation days reset at year-end.{" "}
          <span className="text-brand-light underline">See all details</span>
        </p>
        <button type="button" className={pillButton}>
          My requests
        </button>
      </div>
    </div>
  );
}
