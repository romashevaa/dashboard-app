"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Sidebar } from "./sidebar";

/**
 * Mobile-only navigation: a burger button that opens the Sidebar as an
 * off-canvas drawer with a backdrop. Hidden on md+ where the static rail shows.
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-md border border-white/10 text-foreground transition-colors hover:bg-white/5"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-background shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-white"
            >
              <X className="size-5" aria-hidden />
            </button>
            <Sidebar isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
