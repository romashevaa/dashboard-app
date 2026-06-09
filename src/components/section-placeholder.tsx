import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmojiIcon } from "@/components/ui/emoji-icon";

/**
 * Lightweight placeholder for feature sections that are scaffolded but not yet
 * built. Replaced as each feature lands (CLAUDE.md → Build sequence).
 */
export function SectionPlaceholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  /** Emoji image name in /public/emoji. */
  icon: string;
}) {
  return (
    <section>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-white/10">
          <EmojiIcon name={icon} size={22} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid place-items-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          This section is coming soon.
        </p>
      </div>
    </section>
  );
}
