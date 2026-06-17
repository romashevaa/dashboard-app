"use client";

import { useState } from "react";
import { Check, Copy, Mail, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/ui/emoji-icon";
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

/** A contact line: icon + clickable value, with a subtle copy-on-hover. */
function ContactRow({
  icon: Icon,
  href,
  value,
}: {
  icon: typeof Phone;
  href: string;
  value: string;
}) {
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
    <div className="group/c flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <a
        href={href}
        className="min-w-0 flex-1 truncate text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        {value}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${value}`}
        title={copied ? "Copied" : "Copy"}
        className={cn(
          "shrink-0 rounded text-muted-foreground outline-none transition-all hover:text-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60",
          "opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/c:opacity-100"
        )}
      >
        {copied ? (
          <Check className="size-3.5 text-brand-light" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}

export function MemberCard({ member }: { member: Member }) {
  const name = displayName(member);
  const socials = memberSocials(member);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-white/[0.06] bg-background p-5 transition-colors hover:border-white/[0.12]">
      <div className="flex items-start gap-4">
        <UserAvatar
          name={name}
          src={member.avatar_url}
          className="size-14 rounded-full text-lg ring-1 ring-white/10"
        />

        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {member.position || member.role}
            </p>
            {member.birthdate ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <EmojiIcon name="gift" size={14} />
                {birthdayFormat.format(new Date(member.birthdate))}
              </p>
            ) : null}
          </div>

          {socials.length > 0 ? (
            <div className="flex shrink-0 items-center gap-1.5">
              {socials.map(({ key, label, url, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid size-8 place-items-center rounded-md bg-white/[0.05] text-muted-foreground outline-none transition-colors hover:bg-white/[0.1] hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-white/[0.06] pt-4">
        {member.phone ? (
          <ContactRow
            icon={Phone}
            href={`tel:${member.phone.replace(/\s+/g, "")}`}
            value={member.phone}
          />
        ) : null}
        <ContactRow icon={Mail} href={`mailto:${member.email}`} value={member.email} />
      </div>
    </div>
  );
}
