import { cn } from "@/lib/utils";

// Sample data — replaced by the Events feature (and Google Sheets sync) later.
const EVENTS = [
  { emoji: "🎉", date: "Jan 1, Mon", title: "New Year's Day", highlight: false },
  { emoji: "🌴", date: "Jul 2 – Jul 12", title: "It's Vacation Time!", highlight: true },
  { emoji: "🎉", date: "Jan 7, Thu", title: "Orthodox Christmas Day", highlight: false },
];

export function EventsCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-lg bg-background p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">📆 Agency events</h2>
        <button
          type="button"
          className="shrink-0 rounded-md border border-white/10 bg-surface px-3 py-1.5 text-sm font-medium text-foreground"
        >
          All Events
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {EVENTS.map((event) => (
          <li
            key={event.title}
            className={cn(
              "flex items-center gap-4 rounded-lg px-5 py-4",
              event.highlight ? "bg-brand" : "bg-[#1c2254]"
            )}
          >
            <span
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-lg"
              aria-hidden
            >
              {event.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{event.date}</p>
              <p className="truncate text-sm text-muted-foreground">
                {event.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
