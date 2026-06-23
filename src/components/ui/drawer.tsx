"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A right-side slide-in drawer: backdrop, Escape-to-close, scroll lock, and
 * focus return to the trigger on close. Slides in/out over the app shell.
 * Mirrors the centered Modal but anchored to the right edge.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Keep the drawer mounted through its exit transition.
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setRender(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    // Move focus into the drawer once it's on screen.
    const focusId = requestAnimationFrame(() => {
      if (!dialogRef.current?.contains(document.activeElement)) {
        dialogRef.current?.focus();
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusId);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop: click to close, out of tab order. */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default bg-black/60 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl outline-none transition-transform duration-200 ease-out",
          visible ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          {title ? (
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
