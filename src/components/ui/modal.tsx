"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A simple centered modal: backdrop, Escape-to-close, scroll lock, focus trap,
 * and focus return to the trigger on close. Rendered over the viewport (fixed),
 * so it sits above the app shell.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    // Move focus into the dialog, unless a field already grabbed it (autoFocus).
    if (!dialogRef.current?.contains(document.activeElement)) {
      (focusables()[0] ?? dialogRef.current)?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Keep Tab focus within the dialog.
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      // Restore focus to whatever opened the modal.
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: clickable to close, but out of the tab order and hidden from
          screen readers (the header's X handles that semantically). */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-white/10 bg-surface p-6 shadow-2xl outline-none",
          className
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
