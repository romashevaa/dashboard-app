import { cn } from "@/lib/utils";

/**
 * Webfolks brand lockup: a forward double-chevron mark + wordmark, approximating
 * the Figma logo. Swap the SVG for the official asset when available.
 */
export function WebfolksLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M3.5 6.5 12.5 14 3.5 21.5"
          stroke="#2EB2FF"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 6.5 21.5 14 12.5 21.5"
          stroke="#0059D6"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight text-foreground">
        WebFolks
      </span>
    </div>
  );
}
