"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

// Re-exported so existing imports (`./service-avatar`) keep working; the
// implementation lives in a plain module usable from server code too.
export { faviconFor } from "@/lib/credentials/favicon";

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
        "grid size-6 shrink-0 place-items-center overflow-hidden rounded text-xs font-bold text-white",
        // Background only behind the letter fallback — behind an icon it shows
        // through transparent corners (e.g. circular favicons) as a grey box.
        !showIcon && "bg-white/10",
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
