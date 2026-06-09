import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Renders an Apple-style emoji as an image (from /public/emoji) so the
 * iconography looks identical on every OS — including Windows, which renders
 * native emoji differently. Mirrors the emoji used in the Figma design.
 */
export function EmojiIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/emoji/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      draggable={false}
      className={cn("inline-block shrink-0 select-none", className)}
    />
  );
}
