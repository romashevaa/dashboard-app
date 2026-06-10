"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Copies a value to the clipboard without revealing it on screen, showing a
 * brief confirmation. (Reveal/copy audit logging comes with the real data.)
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      className={cn(
        "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
    >
      {copied ? (
        <Check className="size-4 text-brand-light" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  );
}
