import { cn } from "@/lib/utils";

const DOCS = [
  { emoji: "🪙", label: "Salary" },
  { emoji: "⏳", label: "Time Tracking" },
  { emoji: "📊", label: "Status Updates" },
];

export function OnboardingCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0b1643] p-5",
        className
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight">
        📄 Agency Onboarding
      </h2>
      <ul className="flex flex-col gap-2">
        {DOCS.map((doc) => (
          <li
            key={doc.label}
            className="flex items-center gap-3 rounded-lg bg-[#151f4b] px-4 py-3"
          >
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm"
              aria-hidden
            >
              {doc.emoji}
            </span>
            <span className="text-sm font-medium text-white/70">
              {doc.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
