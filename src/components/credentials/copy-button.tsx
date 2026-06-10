"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copies a value to the clipboard without revealing it on screen, showing a
 * brief confirmation. (Reveal/copy audit logging comes with the real data.)
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
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
      className="shrink-0 text-muted-foreground transition-colors hover:text-white"
    >
      {copied ? (
        <Check className="size-4 text-brand-light" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  );
}
