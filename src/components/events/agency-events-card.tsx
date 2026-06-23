"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { CardHeading } from "@/components/dashboard/card-heading";
import { Drawer } from "@/components/ui/drawer";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import type {
  AgencyEvents,
  BirthdayItem,
  HolidayItem,
} from "@/lib/events/agency-events";

type Tab = "holidays" | "birthdays";

/**
 * Dashboard "Agency events" block. Looks like the other dashboard tiles, but
 * instead of navigating it opens a right-side drawer with a Holidays/Birthdays
 * toggle (Figma node 930:8992 / 930:9873).
 */
export function AgencyEventsCard({
  holidays,
  birthdays,
  className,
}: AgencyEvents & { className?: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("holidays");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex flex-col gap-5 rounded-xl bg-background p-5 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/60",
          className
        )}
      >
        <CardHeading
          icon="calendar"
          title="Agency events"
          subtitle="Upcoming holidays & events"
          linked
        />
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Agency Events">
        <div className="flex flex-col gap-5">
          {/* Holidays / Birthdays toggle */}
          <div
            role="tablist"
            aria-label="Agency events"
            className="flex gap-1 rounded-lg bg-background p-1"
          >
            <TabButton
              label="Holidays"
              active={tab === "holidays"}
              onClick={() => setTab("holidays")}
            />
            <TabButton
              label="Birthdays"
              active={tab === "birthdays"}
              onClick={() => setTab("birthdays")}
            />
          </div>

          {tab === "holidays" ? (
            <HolidayList holidays={holidays} />
          ) : (
            <BirthdayList birthdays={birthdays} />
          )}
        </div>
      </Drawer>
    </>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60",
        active ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

function HolidayList({ holidays }: { holidays: HolidayItem[] }) {
  if (holidays.length === 0) {
    return <Empty>No holidays yet.</Empty>;
  }
  return (
    <ul className="flex flex-col">
      {holidays.map((h) => (
        <li
          key={h.id}
          className="flex items-center gap-3 border-b border-white/[0.06] py-3 last:border-b-0"
        >
          <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-white/[0.06] leading-none">
            <span className="text-base font-semibold text-foreground">{h.day}</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {h.month}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
            {h.moved ? (
              <p className="truncate text-xs text-muted-foreground">
                Holiday on {h.realLabel}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function BirthdayList({ birthdays }: { birthdays: BirthdayItem[] }) {
  if (birthdays.length === 0) {
    return <Empty>No birthdays yet — add birthdates on member profiles.</Empty>;
  }
  return (
    <ul className="flex flex-col">
      {birthdays.map((b) => (
        <li
          key={b.id}
          className="flex items-center gap-3 border-b border-white/[0.06] py-3 last:border-b-0"
        >
          <UserAvatar name={b.name} src={b.avatarUrl} className="size-10 text-sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <EmojiIcon name="gift" size={14} />
              {b.label}
            </p>
            <p className="truncate text-sm text-muted-foreground">{b.name}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
