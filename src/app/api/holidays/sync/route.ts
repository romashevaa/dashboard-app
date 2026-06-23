import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Holiday sync endpoint. A Google Apps Script bound to the team's holidays
 * sheet POSTs the full row set here whenever the sheet is edited (and on a
 * daily safety-net trigger), so the `holidays` table mirrors the sheet within
 * seconds — the sheet stays the source of truth.
 *
 * Auth is a shared bearer secret (HOLIDAYS_SYNC_SECRET). The write uses the
 * service-role client (bypasses RLS) — this route is the only caller, never
 * reachable from the client.
 *
 * Body: { "rows": [{ "date": "2026-01-01", "observed": "2026-01-02"|null,
 *                    "name": "New Year", "emoji": "🎉"|null }, ...] }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type IncomingRow = {
  date?: unknown;
  observed?: unknown;
  name?: unknown;
  emoji?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const secret = process.env.HOLIDAYS_SYNC_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Sync is not configured." },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: { rows?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const incoming = Array.isArray(payload.rows) ? (payload.rows as IncomingRow[]) : null;
  if (!incoming) {
    return NextResponse.json(
      { ok: false, error: "Expected a `rows` array." },
      { status: 400 }
    );
  }

  // Keep only well-formed rows (valid date + a name). A single bad row in the
  // sheet shouldn't break the whole sync.
  const rows = incoming
    .map((r) => {
      const date = str(r.date);
      const observed = str(r.observed);
      const name = str(r.name);
      const emoji = str(r.emoji);
      return {
        name,
        holiday_date: date,
        observed_date: ISO_DATE.test(observed) && observed !== date ? observed : null,
        emoji: emoji || null,
      };
    })
    .filter((r) => r.name && ISO_DATE.test(r.holiday_date));

  // Never wipe the table from an empty/garbage payload — that would blank the
  // feature on a bad edit. Require at least one valid row.
  if (rows.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid rows to sync.", received: incoming.length },
      { status: 400 }
    );
  }

  const synced_at = new Date().toISOString();
  const supabase = createAdminClient();

  // Replace the set: the sheet is canonical, so drop and re-insert.
  const { error: deleteError } = await supabase
    .from("holidays")
    .delete()
    .not("id", "is", null);
  if (deleteError) {
    return NextResponse.json(
      { ok: false, error: deleteError.message },
      { status: 500 }
    );
  }

  const { error: insertError } = await supabase
    .from("holidays")
    .insert(rows.map((r) => ({ ...r, synced_at })));
  if (insertError) {
    return NextResponse.json(
      { ok: false, error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    synced: rows.length,
    received: incoming.length,
  });
}
