import { EmojiIcon } from "@/components/ui/emoji-icon";

/**
 * Body for feature sections that are scaffolded but not yet built. The section
 * title (and a back-to-dashboard arrow) is rendered in the header (PageTitle);
 * here we show a polished, intentional empty state — the feature's emoji, a
 * one-line description, and a "coming soon" pill.
 */
export function SectionPlaceholder({
  icon,
  title,
  description,
}: {
  /** Emoji image name in /public/emoji (see EmojiIcon). */
  icon?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        {icon ? (
          <span className="grid size-14 place-items-center rounded-full bg-white/[0.06]">
            <EmojiIcon name={icon} size={28} />
          </span>
        ) : null}

        <div className="space-y-1">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-accent-yellow" aria-hidden />
          Coming soon
        </span>
      </div>
    </section>
  );
}
