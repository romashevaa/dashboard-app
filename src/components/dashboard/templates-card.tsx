import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EmojiIcon } from "@/components/ui/emoji-icon";
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
        "group flex items-center gap-4 rounded-xl bg-background px-5 py-4 transition-colors hover:bg-accent",
        className
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[0.12] transition-colors group-hover:bg-white/20">
        <EmojiIcon name="writing-hand" size={24} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Messages templates
          </h2>
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.16] opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowRight className="size-3 text-white" aria-hidden />
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Copy, adjust, send!
        </p>
      </div>
    </Link>
  );
}
