"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      className="inline-flex min-w-0 max-w-full items-center gap-2 rounded text-left outline-none transition-colors hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span className="truncate">{display ?? value}</span>
      {copied ? (
        <Check className="size-4 shrink-0 text-brand-light" aria-hidden />
      ) : (
        <Copy
          className={cn("size-4 shrink-0 text-muted-foreground", iconClassName)}
          aria-hidden
        />
      )}
    </button>
  );
}
