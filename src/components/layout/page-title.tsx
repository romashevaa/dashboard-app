"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EmojiIcon } from "@/components/ui/emoji-icon";
import { ADMIN_NAV_ITEM, NAV_ITEMS } from "@/lib/nav";

const titleClass =
  "flex min-w-0 flex-1 items-center gap-3 text-lg font-semibold tracking-tight md:text-xl";

/**
 * Header title, shown on the same line as the account controls. On the
 * dashboard it's the greeting; on other pages it's a back-to-dashboard arrow
 * plus the section's icon + name (so pages don't render their own title).
 */
export function PageTitle({ name }: { name: string }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <p className={titleClass}>
        <EmojiIcon name="wave" size={22} />
        <span className="truncate">Hello, {name}!</span>
      </p>
    );
  }

  // Pages reached outside the sidebar nav (e.g. the account avatar, or the
  // dashboard blocks that link to not-yet-promoted sections).
  const EXTRA: Record<string, { label: string; icon: string }> = {
    "/profile": { label: "My profile", icon: "technologist" },
    "/events": { label: "Events", icon: "calendar" },
    "/links": { label: "Links", icon: "link" },
  };

  const item =
    EXTRA[pathname] ??
    [...NAV_ITEMS, ADMIN_NAV_ITEM].find(
      (i) =>
        i.href !== "/" &&
        (pathname === i.href || pathname.startsWith(`${i.href}/`))
    );

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
      <Link
        href="/"
        aria-label="Back to dashboard"
        className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </Link>
      {item ? (
        <p className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight md:gap-3 md:text-xl">
          <EmojiIcon name={item.icon} size={22} />
          <span className="truncate">{item.label}</span>
        </p>
      ) : null}
    </div>
  );
}
