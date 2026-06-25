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
          "flex flex-col gap-5 rounded-xl bg-background p-5",
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

        {/* Today + the holidays around it — desktop only, matching the other
            cards which reveal their visual at lg. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open agency events"
          className="hidden min-h-0 flex-1 flex-col gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60 lg:flex"
        >
          <TodayStrip today={today} />

          <div className="flex flex-col gap-2">
            {nextHoliday ? (
              <HolidayRow data={nextHoliday} label="Up next" highlighted />
            ) : null}
            {previousHoliday ? (
              <HolidayRow data={previousHoliday} label="Previous" />
            ) : null}
            {!nextHoliday && !previousHoliday ? (
              <p className="rounded-lg bg-white/[0.04] px-3 py-4 text-center text-xs text-muted-foreground">
                No holidays on record yet.
              </p>
            ) : null}
          </div>
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

/** Today's weekday + date; switches to a celebratory state on a holiday. */
function TodayStrip({ today }: { today: TodayInfo }) {
  const monthChip = today.monthLabel.slice(0, 3).toUpperCase();

  if (today.holiday) {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-[#17238c] to-[#0059d6] p-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white/15 text-2xl leading-none">
          {today.holiday.emoji ?? "🎉"}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
            Today · {today.weekday}
          </p>
          <p className="truncate text-sm font-semibold text-white">
            {today.holiday.name}
          </p>
          <p className="text-xs text-white/70">
            {today.monthLabel} {today.day}, {today.year}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.04] p-3">
      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0059d6] leading-none text-white">
        <span className="text-base font-bold">{today.day}</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          {monthChip}
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2eb2ff]">
          Today
        </p>
        <p className="text-sm font-semibold text-foreground">{today.weekday}</p>
        <p className="text-xs text-muted-foreground">
          {today.monthLabel} {today.day}, {today.year}
        </p>
      </div>
    </div>
  );
}

/** A single holiday line (emoji + date/weekday + name + relative distance). */
function HolidayRow({
  data,
  label,
  highlighted = false,
}: {
  data: HolidayHighlight;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5",
        highlighted ? "bg-[#0059d6]" : "bg-white/[0.04]"
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full text-lg leading-none",
          highlighted ? "bg-white/15" : "bg-white/[0.06]"
        )}
      >
        {data.emoji ?? "📌"}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            highlighted ? "text-white" : "text-foreground"
          )}
        >
          {data.dateLabel}, {data.weekday}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            highlighted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {data.name}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            highlighted ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p
          className={cn("text-xs", highlighted ? "text-white" : "text-foreground/80")}
        >
          {data.relative}
        </p>
      </div>
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
