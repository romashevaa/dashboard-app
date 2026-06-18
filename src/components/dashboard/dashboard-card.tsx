import Link from "next/link";

import { CardHeading } from "@/components/dashboard/card-heading";
import { cn } from "@/lib/utils";

/**
 * A dashboard grid area: icon + title + subtitle, with an optional visual
 * (children). The visual should be hidden below `lg` so smaller screens show
 * only the icon/title/subtitle summary.
 *
 * Pass `href` to make the whole card a link — it then gets the same hover
 * affordance as the Templates/Credentials cards (background brightens, focus
 * ring, and an arrow reveals on hover via `CardHeading`'s `linked`).
 */
export function DashboardCard({
  title,
  subtitle,
  icon,
  href,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Emoji image name in /public/emoji. */
  icon: string;
  /** When set, the card becomes a link with a hover/focus affordance. */
  href?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const baseClass =
    "flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group outline-none transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-ring/60",
          baseClass,
          className
        )}
      >
        <CardHeading icon={icon} title={title} subtitle={subtitle} linked />
        {children}
      </Link>
    );
  }

  return (
    <section className={cn(baseClass, className)}>
      <CardHeading icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}
