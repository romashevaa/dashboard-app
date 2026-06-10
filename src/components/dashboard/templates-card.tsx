import Link from "next/link";

import { CardHeading } from "@/components/dashboard/card-heading";
import { cn } from "@/lib/utils";

/**
 * Dashboard Message templates card (Figma node 920:7266). Icon + title +
 * supporting text, linking to the Templates section; arrow appears on hover.
 */
export function TemplatesCard({ className }: { className?: string }) {
  return (
    <Link
      href="/templates"
      className={cn(
        "group flex items-center rounded-xl bg-background px-5 py-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
    >
      <CardHeading
        icon="writing-hand"
        title="Messages templates"
        subtitle="Copy, adjust, send!"
        linked
      />
    </Link>
  );
}
