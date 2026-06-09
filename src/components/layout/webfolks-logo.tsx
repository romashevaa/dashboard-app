import { cn } from "@/lib/utils";

/**
 * Webfolks brand lockup: a blue→cyan "W" chevron mark with a yellow diamond
 * accent + wordmark, recreated from the brand logo. If you have the official
 * asset, drop it in /public and render it here instead.
 */
export function WebfolksLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="30"
        height="26"
        viewBox="0 0 34 30"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id="wf-mark"
            x1="2"
            y1="0"
            x2="32"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2F74FF" />
            <stop offset="1" stopColor="#36C6FF" />
          </linearGradient>
        </defs>
        <path
          d="M2 5 10.5 21 17 8.5 23.5 21 32 5"
          stroke="url(#wf-mark)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17 22.5 20 25.5 17 28.5 14 25.5Z" fill="#F8CD46" />
      </svg>
      <span className="text-base font-semibold tracking-tight text-foreground">
        WebFolks
      </span>
    </div>
  );
}
