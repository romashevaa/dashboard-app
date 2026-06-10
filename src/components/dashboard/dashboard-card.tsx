import { EmojiIcon } from "@/components/ui/emoji-icon";
import { cn } from "@/lib/utils";

/**
 * A dashboard grid area: icon + title + subtitle, with an optional visual
 * (children). The visual should be hidden below `lg` so smaller screens show
 * only the icon/title/subtitle summary.
 */
export function DashboardCard({
  title,
  subtitle,
  icon,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Emoji image name in /public/emoji. */
  icon: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[0.12]">
          <EmojiIcon name={icon} size={24} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
