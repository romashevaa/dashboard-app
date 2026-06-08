import { cn } from "@/lib/utils";

export function TemplatesCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg bg-background p-5",
        className
      )}
    >
      <span
        className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-2xl"
        aria-hidden
      >
        ✍️
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight">
          Messages templates
        </h2>
        <p className="text-sm text-muted-foreground">Copy, adjust, send!</p>
      </div>
    </div>
  );
}
