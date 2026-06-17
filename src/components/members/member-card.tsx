import { Mail, Phone } from "lucide-react";

import { UserAvatar } from "@/components/ui/user-avatar";
import type { Profile } from "@/lib/db/types";

export type Member = Pick<
  Profile,
  | "id"
  | "full_name"
  | "email"
  | "avatar_url"
  | "role"
  | "position"
  | "phone"
  | "telegram"
  | "hire_date"
>;

const joinedFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

function displayName(m: Member): string {
  const base = m.full_name?.trim() || m.email.split("@")[0] || m.email;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.94 4.66a1.3 1.3 0 0 0-1.32-.2L3.36 11.1c-.86.34-.85 1.57.02 1.9l4.2 1.56 1.62 5.05a1 1 0 0 0 1.6.46l2.4-2.05 4.2 3.08c.64.47 1.55.13 1.72-.65l3.06-14.2a1.3 1.3 0 0 0-.24-1.09ZM9.7 14.2l8.1-5.36-6.6 6.07a1 1 0 0 0-.31.6l-.27 2-.92-3.3Z" />
    </svg>
  );
}

const contactLink =
  "inline-flex max-w-full items-center gap-2 rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60";

/**
 * One person in the member directory: avatar, name, role/position, and tappable
 * contacts (email, phone, Telegram — Telegram opens a chat at t.me/<handle>).
 */
export function MemberCard({ member }: { member: Member }) {
  const name = displayName(member);
  const tgHandle = member.telegram?.replace(/^@/, "").trim();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-background p-5">
      <div className="flex items-center gap-3">
        <UserAvatar
          name={name}
          src={member.avatar_url}
          className="size-12 text-base"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="truncate text-sm capitalize text-muted-foreground">
            {member.position || member.role}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <a href={`mailto:${member.email}`} className={contactLink}>
          <Mail className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{member.email}</span>
        </a>
        {member.phone ? (
          <a href={`tel:${member.phone.replace(/\s+/g, "")}`} className={contactLink}>
            <Phone className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{member.phone}</span>
          </a>
        ) : null}
        {tgHandle ? (
          <a
            href={`https://t.me/${tgHandle}`}
            target="_blank"
            rel="noreferrer"
            className={contactLink}
          >
            <TelegramIcon className="size-4 shrink-0" />
            <span className="truncate">@{tgHandle}</span>
          </a>
        ) : null}
      </div>

      {member.hire_date ? (
        <p className="border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
          Joined {joinedFormat.format(new Date(member.hire_date))}
        </p>
      ) : null}
    </div>
  );
}
