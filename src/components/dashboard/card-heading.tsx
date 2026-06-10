import { ArrowRight } from "lucide-react";

import { EmojiIcon } from "@/components/ui/emoji-icon";
import { cn } from "@/lib/utils";

/**
 * Shared dashboard card heading: emoji-in-circle + title + optional subtitle.
 * Set `linked` on cards that are links — it reveals an arrow and brightens the
 * icon on hover/focus (the parent must be a `group`).
 */
export function CardHeading({
  icon,
  title,
  subtitle,
  linked = false,
  className,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  linked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[0.12] transition-colors group-hover:bg-white/[0.18]">
        <EmojiIcon name={icon} size={24} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {linked ? (
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.16] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <ArrowRight className="size-3 text-white" aria-hidden />
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
