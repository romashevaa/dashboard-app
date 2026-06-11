"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";

/**
 * Mobile-only navigation: a burger button that opens the Sidebar as a
 * full-width drawer with a backdrop. Hidden on md+ where the static rail shows.
 */
export function MobileNav({
  isAdmin = false,
  isRealAdmin = false,
  previewingAsMember = false,
}: {
  isAdmin?: boolean;
  isRealAdmin?: boolean;
  previewingAsMember?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // While the drawer is open, close on Escape and lock background scrolling.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-full bg-background shadow-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-5 size-9 text-muted-foreground"
            >
              <X className="size-5" aria-hidden />
            </Button>
            <Sidebar
              isAdmin={isAdmin}
              isRealAdmin={isRealAdmin}
              previewingAsMember={previewingAsMember}
              onNavigate={() => setOpen(false)}
              className="w-full"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
