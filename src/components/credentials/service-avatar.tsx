"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/** Derives a favicon URL for a service URL (or undefined if it can't parse). */
export function faviconFor(url: string): string | undefined {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}

/**
 * Service icon: shows the website favicon when available, otherwise a letter
 * avatar (also the explicit choice via `noIcon`). Falls back to the letter if
 * the icon fails to load.
 */
export function ServiceAvatar({
  name,
  iconUrl,
  noIcon = false,
  className,
}: {
  name: string;
  iconUrl?: string;
  noIcon?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showIcon = !noIcon && Boolean(iconUrl) && !failed;

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center overflow-hidden rounded bg-white/10 text-xs font-bold text-white",
        className
      )}
    >
      {showIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt=""
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        name.charAt(0).toUpperCase() || "?"
      )}
    </span>
  );
}
