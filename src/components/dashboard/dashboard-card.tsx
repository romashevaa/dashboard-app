import { EmojiIcon } from "@/components/ui/emoji-icon";
import { cn } from "@/lib/utils";

/**
 * A dashboard grid area. For now it's a skeleton — border, padding, and a
 * heading — with content filled in iteratively per feature.
 */
export function DashboardCard({
  title,
  icon,
  className,
  children,
}: {
  title: string;
  /** Emoji image name in /public/emoji. */
  icon: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5",
        className
      )}
    >
      <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
        <EmojiIcon name={icon} size={22} />
        {title}
      </h2>
      {children}
    </section>
  );
}
