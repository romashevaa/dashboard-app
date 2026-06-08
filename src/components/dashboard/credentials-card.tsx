import { Copy, Lock, User } from "lucide-react";

import { cn } from "@/lib/utils";

export function CredentialsCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-white/40 bg-gradient-to-b from-[#17238c] to-[#111a68] p-5",
        className
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight">🔐 Credentials</h2>

      <div className="rounded-lg bg-white/5 p-4">
        <p className="mb-2 text-sm font-semibold text-white">Webflow</p>
        <div className="flex items-center justify-between border-y border-white/10 py-3">
          <span className="flex items-center gap-2 text-sm text-white/80">
            <User className="size-4 shrink-0" aria-hidden />
            webflowproaccount
          </span>
          <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="flex items-center gap-2 text-sm tracking-widest text-white/80">
            <Lock className="size-4 shrink-0" aria-hidden />
            •••••••••••
          </span>
          <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      </div>
    </div>
  );
}
