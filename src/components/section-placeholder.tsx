/**
 * Lightweight placeholder for feature sections that are scaffolded but not yet
 * built. Replaced as each feature lands (CLAUDE.md → Build sequence).
 */
export function SectionPlaceholder({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <span
          className="grid size-10 place-items-center rounded-lg bg-white/10 text-xl"
          aria-hidden
        >
          {emoji}
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
