import { cn } from "@/lib/utils";

// Placeholder tool glyphs — swapped for real resource logos when the
// Resources feature is built.
const TOOLS = ["🔍", "✦", "🎨", "🌐", "▶️", "💬", "◆", "📚", "🧩", "⚡"];

export function ResourcesCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-white/40 bg-[#052b61] p-5",
        className
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight">🦄 Resources</h2>
      <div className="grid grid-cols-5 gap-3">
        {TOOLS.map((tool, i) => (
          <span
            key={i}
            className="grid aspect-square place-items-center rounded-lg bg-white/[0.08] text-xl shadow-sm"
            aria-hidden
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}
