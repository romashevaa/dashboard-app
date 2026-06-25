import { createClient } from "@/lib/supabase/server";
import type { Holiday, Profile } from "@/lib/db/types";

/**
 * Data for the Agency Events drawer (Holidays + Birthdays tabs).
 *
 * Holidays come from the `holidays` table (mirrored from a team Google Sheet
 * later). Birthdays are derived from `profiles.birthdate`. Both lists are
 * ordered "upcoming first" — the next event from today, wrapping past the
 * year end — which is what the dashboard wants to surface.
 *
 * Dates are stored as plain `YYYY-MM-DD` (no time). We parse the parts by hand
 * rather than `new Date(iso)` to avoid timezone shifting the day.
 */

const MONTH_CHIP = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
const MONTH_LABEL = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** A holiday row, ready to render in the Holidays tab. */
export type HolidayItem = {
  id: string;
  name: string;
  emoji: string | null;
  /** Day-of-month of the effective day off (observed date if moved). */
  day: number;
  /** 3-letter month of the effective day off. */
  month: string;
  /** Full weekday of the day off — the headline fact, e.g. "Monday". */
  weekday: string;
  /** True when the day off was transferred (e.g. weekend → Monday). */
  moved: boolean;
  /** Full weekday of the original holiday date when moved, e.g. "Sunday". */
  realWeekday: string | null;
  /** The original holiday date when moved, e.g. "Jun 28". */
  realDate: string | null;
};

/** A birthday, ready to render in the Birthdays tab. */
export type BirthdayItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** e.g. "Nov 24". */
  label: string;
};

/** A compact holiday reference for the dashboard card (today / prev / next). */
export type HolidayHighlight = {
  id: string;
  name: string;
  emoji: string | null;
  /** "Jun 28" — the effective day-off date. */
  dateLabel: string;
  /** "Sun" — short weekday of the effective date. */
  weekday: string;
  /** "Sunday" — full weekday of the effective date. */
  weekdayLong: string;
  /** Signed day distance from today (positive = future, negative = past, 0 = today). */
  days: number;
  /** Human relative distance, e.g. "in 3 days" / "Today" / "12 days ago". */
  relative: string;
};

/** Today's date for the dashboard card, plus any holiday landing on it. */
export type TodayInfo = {
  /** "Thursday". */
  weekday: string;
  /** "June". */
  monthLabel: string;
  /** 25. */
  day: number;
  /** 2026. */
  year: number;
  /** The holiday falling exactly today, if any. */
  holiday: HolidayHighlight | null;
};

export type AgencyEvents = {
  holidays: HolidayItem[];
  birthdays: BirthdayItem[];
  today: TodayInfo;
  /** Most recent past holiday (null if none on record). */
  previousHoliday: HolidayHighlight | null;
  /** Soonest upcoming holiday (null if none on record). */
  nextHoliday: HolidayHighlight | null;
};

/** month*100 + day, for "upcoming first" comparison within a year. */
function monthDayKey(month: number, day: number): number {
  return month * 100 + day;
}

function parts(iso: string): { month: number; day: number } {
  const [, m, d] = iso.split("-").map(Number);
  return { month: m, day: d };
}

/** "Monday" — weekday computed in UTC to avoid timezone drift. */
function weekdayFull(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAY_FULL[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** "Jun 28" — month + day, no weekday. */
function monthDay(iso: string): string {
  const { month, day } = parts(iso);
  return `${MONTH_LABEL[month - 1]} ${day}`;
}

/** "Sun" — short weekday. */
function weekdayShort(iso: string): string {
  return weekdayFull(iso).slice(0, 3);
}

/** UTC midnight epoch for a YYYY-MM-DD string — safe to subtract for day math. */
function isoUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function displayName(p: Pick<Profile, "first_name" | "last_name" | "full_name" | "email">): string {
  const base =
    [p.first_name?.trim(), p.last_name?.trim()].filter(Boolean).join(" ") ||
    p.full_name?.trim() ||
    p.email.split("@")[0] ||
    p.email;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function getAgencyEvents(): Promise<AgencyEvents> {
  const supabase = await createClient();

  // "Today" is evaluated in the agency's timezone (Kyiv), not the server's UTC
  // clock, so the date/weekday and the previous/next split stay correct near
  // midnight.
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(new Date());
  const part = (type: string) =>
    todayParts.find((p) => p.type === type)?.value ?? "";

  const tYear = Number(part("year"));
  const tMonth = Number(part("month")); // 1-12
  const tDay = Number(part("day"));
  const tWeekday = part("weekday"); // "Thursday"
  const todayKey = monthDayKey(tMonth, tDay);

  const [holidaysRes, profilesRes] = await Promise.all([
    supabase.from("holidays").select("*"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name, full_name, avatar_url, email, birthdate")
      .not("birthdate", "is", null),
  ]);

  const holidays: HolidayItem[] = ((holidaysRes.data ?? []) as Holiday[])
    .map((h) => {
      const effective = h.observed_date ?? h.holiday_date;
      const eff = parts(effective);
      const moved = Boolean(h.observed_date && h.observed_date !== h.holiday_date);
      return {
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        day: eff.day,
        month: MONTH_CHIP[eff.month - 1],
        weekday: weekdayFull(effective),
        moved,
        realWeekday: moved ? weekdayFull(h.holiday_date) : null,
        realDate: moved ? monthDay(h.holiday_date) : null,
        _wrap: monthDayKey(eff.month, eff.day) >= todayKey ? 0 : 1,
        _key: monthDayKey(eff.month, eff.day),
      };
    })
    .sort((a, b) => a._wrap - b._wrap || a._key - b._key)
    // drop the private sort fields
    .map(({ _wrap, _key, ...item }) => item);

  type BirthdayRow = Pick<
    Profile,
    "id" | "first_name" | "last_name" | "full_name" | "avatar_url" | "email" | "birthdate"
  >;

  const birthdays: BirthdayItem[] = ((profilesRes.data ?? []) as BirthdayRow[])
    .filter((p) => p.birthdate)
    .map((p) => {
      const { month, day } = parts(p.birthdate as string);
      return {
        id: p.id,
        name: displayName(p),
        avatarUrl: p.avatar_url,
        label: `${MONTH_LABEL[month - 1]} ${day}`,
        _wrap: monthDayKey(month, day) >= todayKey ? 0 : 1,
        _key: monthDayKey(month, day),
      };
    })
    .sort((a, b) => a._wrap - b._wrap || a._key - b._key)
    .map(({ _wrap, _key, ...item }) => item);

  // Today + the holidays bracketing it, for the dashboard card. Compared on
  // UTC-midnight epochs so the "previous / today / next" split is exact.
  const todayUTC = Date.UTC(tYear, tMonth - 1, tDay);
  const dayMs = 86_400_000;

  const toHighlight = (h: Holiday): HolidayHighlight => {
    const eff = h.observed_date ?? h.holiday_date;
    const days = Math.round((isoUTC(eff) - todayUTC) / dayMs);
    const relative =
      days === 0
        ? "Today"
        : days === 1
          ? "Tomorrow"
          : days === -1
            ? "Yesterday"
            : days > 0
              ? `in ${days} days`
              : `${-days} days ago`;
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      dateLabel: monthDay(eff),
      weekday: weekdayShort(eff),
      weekdayLong: weekdayFull(eff),
      days,
      relative,
    };
  };

  const dated = ((holidaysRes.data ?? []) as Holiday[])
    .map((h) => ({ h, t: isoUTC(h.observed_date ?? h.holiday_date) }))
    .sort((a, b) => a.t - b.t);

  const todayRow = dated.find((r) => r.t === todayUTC) ?? null;
  const nextRow = dated.find((r) => r.t > todayUTC) ?? null;
  const prevRow = [...dated].reverse().find((r) => r.t < todayUTC) ?? null;

  const today: TodayInfo = {
    weekday: tWeekday,
    monthLabel: MONTH_LABEL[tMonth - 1],
    day: tDay,
    year: tYear,
    holiday: todayRow ? toHighlight(todayRow.h) : null,
  };

  return {
    holidays,
    birthdays,
    today,
    previousHoliday: prevRow ? toHighlight(prevRow.h) : null,
    nextHoliday: nextRow ? toHighlight(nextRow.h) : null,
  };
}
