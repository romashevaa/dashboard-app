"use client";

import { useState } from "react";
import { Check, Copy, Gift } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Profile } from "@/lib/db/types";
import { memberSocials } from "./social-icons";

export type Member = Pick<
  Profile,
  | "id"
  | "full_name"
  | "email"
  | "avatar_url"
  | "role"
  | "position"
  | "birthdate"
  | "phone"
  | "telegram"
  | "linkedin"
  | "dribbble"
  | "behance"
>;

const birthdayFormat = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
});

function displayName(m: Member): string {
  const base = m.full_name?.trim() || m.email.split("@")[0] || m.email;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** A copyable contact value (blue link + copy button), matching the design. */
function ContactField({ href, value }: { href: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3">
      <a
        href={href}
        className="min-w-0 flex-1 truncate text-sm text-brand-light outline-none hover:underline focus-visible:underline"
      >
        {value}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${value}`}
        title={copied ? "Copied" : "Copy"}
        className="shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {copied ? (
          <Check className="size-4 text-brand-light" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export function MemberCard({ member }: { member: Member }) {
  const name = displayName(member);
  const socials = memberSocials(member);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-background p-5">
      <div className="flex items-start gap-4">
        <UserAvatar
          name={name}
          src={member.avatar_url}
          className="size-14 rounded-full text-lg"
        />

        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {member.position || member.role}
            </p>
            {member.birthdate ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gift className="size-3.5 text-accent-yellow" aria-hidden />
                {birthdayFormat.format(new Date(member.birthdate))}
              </p>
            ) : null}
          </div>

          {socials.length > 0 ? (
            <div className="flex shrink-0 items-center gap-1">
              {socials.map(({ key, label, url, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className={cn(
                    "grid size-7 place-items-center rounded-md bg-white/[0.04] text-muted-foreground outline-none transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
                  )}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {member.phone ? (
          <ContactField
            href={`tel:${member.phone.replace(/\s+/g, "")}`}
            value={member.phone}
          />
        ) : null}
        <ContactField href={`mailto:${member.email}`} value={member.email} />
      </div>
    </div>
  );
}
