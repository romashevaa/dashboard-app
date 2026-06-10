import { cn } from "@/lib/utils";

/**
 * Placeholder service icon — a letter avatar. Swapped for real brand logos
 * when services gain an icon/url in the data model.
 */
export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded bg-white/10 text-xs font-bold text-white",
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
