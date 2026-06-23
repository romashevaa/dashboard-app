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
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** A holiday row, ready to render in the Holidays tab. */
export type HolidayItem = {
  id: string;
  name: string;
  emoji: string | null;
  /** Day-of-month of the effective day off (observed date if moved). */
  day: number;
  /** 3-letter month of the effective day off. */
  month: string;
  /** True when the day off was transferred (e.g. weekend → Monday). */
  moved: boolean;
  /** The original holiday date, e.g. "Jun 28", shown when `moved`. */
  realLabel: string | null;
};

/** A birthday, ready to render in the Birthdays tab. */
export type BirthdayItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  /** e.g. "Nov 24". */
  label: string;
};

export type AgencyEvents = {
  holidays: HolidayItem[];
  birthdays: BirthdayItem[];
};

/** month*100 + day, for "upcoming first" comparison within a year. */
function monthDayKey(month: number, day: number): number {
  return month * 100 + day;
}

function parts(iso: string): { month: number; day: number } {
  const [, m, d] = iso.split("-").map(Number);
  return { month: m, day: d };
}

/** "May 31 (Sun)" — weekday computed in UTC to avoid timezone drift. */
function dateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${MONTH_LABEL[m - 1]} ${d} (${weekday})`;
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

  const now = new Date();
  const todayKey = monthDayKey(now.getMonth() + 1, now.getDate());

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
        moved,
        realLabel: moved ? dateLabel(h.holiday_date) : null,
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

  return { holidays, birthdays };
}
