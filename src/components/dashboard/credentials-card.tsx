import Link from "next/link";
import { ArrowRight, Copy, Lock, User } from "lucide-react";

import { EmojiIcon } from "@/components/ui/emoji-icon";
import { cn } from "@/lib/utils";

/**
 * Dashboard Credentials teaser (Figma node 246:4275 / 920:7753). A clickable
 * card that links to the full Credentials section; on hover the gradient
 * brightens and an arrow appears. The preview is intentionally obscured
 * (redacted service, masked password) — real data is wired up with the
 * Credentials feature.
 */
export function CredentialsCard({ className }: { className?: string }) {
  return (
    <Link
      href="/credentials"
      aria-label="Credentials — all shared accounts in one place"
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-xl border border-white/40 bg-gradient-to-b from-[#17238c] to-[#111a68] pt-5 transition-colors hover:from-[#2030c1] hover:to-[#152184]",
        className
      )}
    >
      <div className="flex items-center gap-3 px-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/[0.12]">
          <EmojiIcon name="lock" size={24} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Credentials
            </h2>
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.16] opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowRight className="size-3 text-white" aria-hidden />
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            All shared accounts in one place
          </p>
        </div>
      </div>

      {/* Obscured preview — clipped at the card's bottom edge. */}
      <div className="px-5">
        <div className="flex flex-col rounded-t-lg border border-white/5 bg-white/[0.04]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="size-6 shrink-0 rounded-full bg-white/10" />
            <span className="h-2 w-28 rounded-full bg-gradient-to-r from-white/25 to-transparent" />
          </div>
          <div className="flex items-center justify-between gap-3 border-y border-white/5 px-4 py-3">
            <span className="flex min-w-0 items-center gap-2 text-sm text-white/70">
              <User className="size-4 shrink-0" aria-hidden />
              <span className="truncate">webflowproaccount</span>
            </span>
            <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 text-sm tracking-widest text-white/70">
              <Lock className="size-4 shrink-0" aria-hidden />
              •••••••••••
            </span>
            <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </div>
        </div>
      </div>
    </Link>
  );
}
