"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";

import { removeUser } from "./actions";

/**
 * Removes a member from the admin list. Two-step (trash → confirm) since it's
 * destructive and permanent; the server action re-checks admin + self-guard.
 */
export function RemoveUserButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeUser(userId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      }
      // On success the row disappears (revalidate), so no state to reset.
    });
  };

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Remove?</span>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          aria-label={`Confirm removing ${name}`}
          className="grid size-8 place-items-center rounded text-destructive outline-none transition-colors hover:text-destructive/80 focus-visible:ring-2 focus-visible:ring-destructive/60 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Check className="size-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          aria-label="Cancel removal"
          className="grid size-8 place-items-center rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
        >
          <X className="size-4" aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Remove ${name}`}
      title={error ?? `Remove ${name}`}
      className="grid size-8 shrink-0 place-items-center rounded text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
