import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A dashboard grid area. For now it's a skeleton — border, padding, and a
 * heading — with content filled in iteratively per feature.
 */
export function DashboardCard({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: LucideIcon;
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
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}
