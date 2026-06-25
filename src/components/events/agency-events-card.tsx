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
  HolidayHighlight,
  HolidayItem,
  TodayInfo,
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
  today,
  previousHoliday,
  nextHoliday,
  className,
}: AgencyEvents & { className?: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("holidays");

  return (
    <>
      <section
        className={cn(
          "flex flex-col gap-5 rounded-xl bg-background p-5 lg:h-full",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <CardHeading
            icon="calendar"
            title="Agency events"
            subtitle="Holidays & birthdays"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/80 outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            All events
          </button>
        </div>

        {/* Countdown to the next holiday — desktop only, matching the other
            cards which reveal their visual at lg. Fills the block: hero grows,
            footer pins to the bottom. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open agency events"
          className="hidden min-h-0 flex-1 flex-col outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring/60 lg:flex"
        >
          <CountdownHero next={nextHoliday} todayHoliday={today.holiday} />
          <HeroFooter today={today} previous={previousHoliday} />
        </button>
      </section>

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

/**
 * The card's focal point: a big countdown to the next holiday. Switches to a
 * celebratory state when a holiday lands on today, and a quiet fallback when
 * there are no upcoming holidays on record.
 */
function CountdownHero({
  next,
  todayHoliday,
}: {
  next: HolidayHighlight | null;
  todayHoliday: HolidayHighlight | null;
}) {
  if (todayHoliday) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2eb2ff]">
          Today
        </p>
        <span className="my-1 text-4xl leading-none">
          {todayHoliday.emoji ?? "🎉"}
        </span>
        <p className="text-xl font-extrabold tracking-tight text-white">
          It&rsquo;s {todayHoliday.name}!
        </p>
        <p className="text-sm text-white/60">
          {todayHoliday.weekdayLong}, {todayHoliday.dateLabel}
        </p>
      </div>
    );
  }

  if (!next) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-center">
        <span className="text-4xl leading-none">🗓️</span>
        <p className="text-sm text-muted-foreground">
          No upcoming holidays on record.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2eb2ff]">
        Next holiday
      </p>
      <span className="mb-1 mt-1 text-4xl leading-none">
        {next.emoji ?? "📌"}
      </span>
      {next.days === 1 ? (
        <p className="text-5xl font-extrabold leading-none tracking-tight text-white">
          Tomorrow
        </p>
      ) : (
        <p className="flex items-baseline justify-center gap-2">
          <span className="text-6xl font-extrabold leading-none tracking-tight text-white">
            {next.days}
          </span>
          <span className="text-lg text-white/60">days away</span>
        </p>
      )}
      <p className="mt-3 text-lg font-semibold text-white/90">{next.name}</p>
      <p className="text-sm text-white/60">
        {next.weekdayLong}, {next.dateLabel}
      </p>
    </div>
  );
}

/** Bottom strip: today's date on the left, the most recent holiday on the right. */
function HeroFooter({
  today,
  previous,
}: {
  today: TodayInfo;
  previous: HolidayHighlight | null;
}) {
  return (
    <div className="flex shrink-0 items-end justify-between gap-3 border-t border-white/[0.08] pt-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
          Today
        </p>
        <p className="text-[13px] text-white/80">
          {today.weekday.slice(0, 3)}, {today.monthLabel} {today.day}
        </p>
      </div>
      {previous ? (
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            Last holiday
          </p>
          <p className="truncate text-[13px] text-white/80">
            {previous.name} · {previous.dateLabel}
          </p>
        </div>
      ) : null}
    </div>
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
            <p className="truncate text-xs">
              <span className="font-medium text-foreground/80">{h.weekday}</span>
              {h.moved ? (
                <span className="text-muted-foreground">
                  {" — moved from "}
                  {h.realWeekday}, {h.realDate}
                </span>
              ) : null}
            </p>
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
