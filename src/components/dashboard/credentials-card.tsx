import Link from "next/link";

import { CardHeading } from "@/components/dashboard/card-heading";
import { cn } from "@/lib/utils";

/**
 * Dashboard Credentials teaser (Figma node 246:4275 / 920:7753). A clickable
 * card that links to the full Credentials section; on hover the gradient
 * brightens and an arrow appears. The obscured preview is the official
 * public/creds.svg asset so it scales as a single unit — real data is wired up
 * with the Credentials feature.
 */
export function CredentialsCard({ className }: { className?: string }) {
  return (
    <Link
      href="/credentials"
      aria-label="Credentials — all shared accounts in one place"
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-xl border border-white/[0.16] bg-gradient-to-b from-[#17238c] to-[#111a68] py-5 outline-none transition-colors hover:from-[#2030c1] hover:to-[#152184] focus-visible:ring-2 focus-visible:ring-ring/60 lg:pb-0",
        className
      )}
    >
      <CardHeading
        icon="lock"
        title="Credentials"
        subtitle="All shared accounts in one place"
        linked
        className="px-5"
      />

      {/* Obscured preview (public/creds.svg) — desktop only. It fills the card
          and bleeds off the right/bottom edges. Hidden below lg so smaller
          screens show just the icon/title/subtitle. */}
      <div className="hidden min-h-0 flex-1 overflow-hidden pl-5 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/creds.svg"
          alt=""
          aria-hidden
          className="size-full max-w-none rounded-tl-lg object-cover object-left-top"
        />
      </div>
    </Link>
  );
}
