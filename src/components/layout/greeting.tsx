"use client";

import { usePathname } from "next/navigation";

import { EmojiIcon } from "@/components/ui/emoji-icon";

/**
 * The "👋 Hello, {name}!" greeting, shown only on the dashboard. On other
 * pages it collapses to an empty spacer so the header controls stay right.
 */
export function Greeting({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <p className="flex min-w-0 flex-1 items-center gap-3 text-lg font-semibold tracking-tight md:text-xl">
      {pathname === "/" ? (
        <>
          <EmojiIcon name="wave" size={22} />
          <span className="truncate">Hello, {name}!</span>
        </>
      ) : null}
    </p>
  );
}
