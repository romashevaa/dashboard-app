"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Click-to-copy value: the value itself is the target (no separate button),
 * with a copy icon as the affordance and a brief confirmation. Copies without
 * revealing — useful for masked passwords. `onCopy` fires on a successful copy
 * (used to audit-log password reveals).
 */
export function CopyText({
  value,
  label,
  display,
  iconClassName,
  onCopy,
}: {
  value: string;
  label: string;
  /** What to show (defaults to the value) — e.g. masked dots for a password. */
  display?: React.ReactNode;
  /** Extra classes for the copy icon (e.g. hover-reveal). */
  iconClassName?: string;
  /** Fired once after the value is successfully copied. */
  onCopy?: () => void;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      onCopy?.();
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      setState("failed");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const title =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Couldn't copy — copy manually"
        : `Copy ${label}`;

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      title={title}
      className="inline-flex min-w-0 max-w-full items-center gap-2 rounded text-left outline-none transition-colors hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span className="truncate">{display ?? value}</span>
      {state === "copied" ? (
        <Check className="size-4 shrink-0 text-brand-light" aria-hidden />
      ) : state === "failed" ? (
        <X className="size-4 shrink-0 text-destructive" aria-hidden />
      ) : (
        <Copy
          className={cn("size-4 shrink-0 text-muted-foreground", iconClassName)}
          aria-hidden
        />
      )}
    </button>
  );
}

