"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2, TriangleAlert, X } from "lucide-react";

import { removeUser } from "./actions";

/**
 * Removes a member from the admin list. Two-step (trash → confirm) since it's
 * destructive and permanent; the server action re-checks admin. Removing your
 * own account signs you out.
 */
export function RemoveUserButton({
  userId,
  name,
  isSelf = false,
}: {
  userId: string;
  name: string;
  isSelf?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const label = isSelf ? "Delete your account" : `Remove ${name}`;
  const confirmText = isSelf ? "Delete account & sign out?" : "Remove?";

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

  if (error) {
    return (
      <span className="flex items-center gap-1.5">
        <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
        <span
          className="max-w-[14rem] truncate text-xs text-destructive"
          title={error}
        >
          {error}
        </span>
        <button
          type="button"
          onClick={() => setError(null)}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-white hover:underline"
        >
          Retry
        </button>
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{confirmText}</span>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          aria-label={isSelf ? "Confirm deleting your account" : `Confirm removing ${name}`}
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
      aria-label={label}
      title={label}
      className="grid size-8 shrink-0 place-items-center rounded text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
