"use client";

import { Menu, X } from "lucide-react";

import { Sidebar } from "./sidebar";

const TOGGLE_ID = "mobile-nav-toggle";

function closeDrawer() {
  const toggle = document.getElementById(TOGGLE_ID);
  if (toggle instanceof HTMLInputElement) toggle.checked = false;
}

/**
 * Mobile navigation drawer driven by a hidden checkbox + labels, so it opens
 * and closes purely with HTML/CSS — no client JS required (important for
 * environments where the page hasn't hydrated). When JS is available, clicking
 * a nav link also closes the drawer; without JS the full-page navigation does.
 * Hidden on md+ where the static rail shows.
 */
export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <div className="md:hidden">
      <input
        type="checkbox"
        id={TOGGLE_ID}
        className="peer sr-only"
        aria-hidden
        tabIndex={-1}
      />

      <label
        htmlFor={TOGGLE_ID}
        aria-label="Open menu"
        className="grid size-9 cursor-pointer place-items-center rounded-md border border-white/10 text-foreground transition-colors hover:bg-white/5"
      >
        <Menu className="size-5" aria-hidden />
      </label>

      {/* Backdrop */}
      <label
        htmlFor={TOGGLE_ID}
        aria-label="Close menu"
        className="invisible fixed inset-0 z-40 cursor-pointer bg-black/60 opacity-0 transition-opacity peer-checked:visible peer-checked:opacity-100"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-full -translate-x-full bg-background shadow-xl transition-transform duration-200 ease-out peer-checked:translate-x-0">
        <label
          htmlFor={TOGGLE_ID}
          aria-label="Close menu"
          className="absolute right-4 top-5 grid size-9 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:text-white"
        >
          <X className="size-5" aria-hidden />
        </label>
        <Sidebar isAdmin={isAdmin} className="w-full" onNavigate={closeDrawer} />
      </div>
    </div>
  );
}
