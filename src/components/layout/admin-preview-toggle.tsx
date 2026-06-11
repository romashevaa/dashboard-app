"use client";

import { useTransition } from "react";
import { Eye, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { setAdminPreview } from "@/lib/auth/preview-actions";

/**
 * Lets a real admin toggle "view as member" — hiding admin-only controls to
 * preview the app as a normal user sees it. The switch is ON when admin tools
 * are active; flipping it off sets the preview cookie and re-renders the tree.
 */
export function AdminPreviewToggle({
  previewingAsMember,
}: {
  previewingAsMember: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const adminToolsOn = !previewingAsMember;

  const toggle = () => {
    startTransition(async () => {
      // Turning admin tools OFF means previewing as member, and vice versa.
      await setAdminPreview(adminToolsOn);
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={adminToolsOn}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
      )}
    >
      {adminToolsOn ? (
        <ShieldCheck className="size-4 shrink-0 text-brand-light" aria-hidden />
      ) : (
        <Eye className="size-4 shrink-0 text-accent-yellow" aria-hidden />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">
          Admin tools
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {adminToolsOn ? "On" : "Viewing as member"}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          adminToolsOn ? "bg-brand" : "bg-white/15"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition-all",
            adminToolsOn ? "left-[1.125rem]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
