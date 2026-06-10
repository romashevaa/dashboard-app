import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Body for feature sections that are scaffolded but not yet built. The section
 * title is rendered in the header (PageTitle), so this is just a back link and
 * a "coming soon" panel.
 */
export function SectionPlaceholder({ description }: { description?: string }) {
  return (
    <section className="flex flex-col gap-5">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>

      <div className="grid place-items-center gap-1 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        {description ? (
          <p className="text-sm text-foreground">{description}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          This section is coming soon.
        </p>
      </div>
    </section>
  );
}
