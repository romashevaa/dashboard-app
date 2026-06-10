import { CardHeading } from "@/components/dashboard/card-heading";
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
      <CardHeading icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}
