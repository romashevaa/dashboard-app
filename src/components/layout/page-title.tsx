"use client";

import { usePathname } from "next/navigation";

import { EmojiIcon } from "@/components/ui/emoji-icon";
import { ADMIN_NAV_ITEM, NAV_ITEMS } from "@/lib/nav";

const titleClass =
  "flex min-w-0 flex-1 items-center gap-3 text-lg font-semibold tracking-tight md:text-xl";

/**
 * Header title, shown on the same line as the account controls. On the
 * dashboard it's the greeting; on other pages it's the section's icon + name
 * (so pages don't render their own title).
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

  // Pages reached outside the sidebar nav (e.g. the account avatar).
  const EXTRA: Record<string, { label: string; icon: string }> = {
    "/profile": { label: "My profile", icon: "technologist" },
  };

  const item =
    EXTRA[pathname] ??
    [...NAV_ITEMS, ADMIN_NAV_ITEM].find(
      (i) =>
        i.href !== "/" &&
        (pathname === i.href || pathname.startsWith(`${i.href}/`))
    );

  return (
    <p className={titleClass}>
      {item ? (
        <>
          <EmojiIcon name={item.icon} size={22} />
          <span className="truncate">{item.label}</span>
        </>
      ) : null}
    </p>
  );
}
