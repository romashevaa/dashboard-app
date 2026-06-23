# Holidays sync (Google Sheet → app)

The **Agency Events → Holidays** list mirrors a Google Sheet the team maintains.
A Google Apps Script bound to the sheet pushes its rows to the app on every
edit, so the `holidays` table updates within seconds — **the sheet is the
source of truth**. No Google service account or published CSV is needed.

```
Google Sheet  ──(Apps Script onEdit)──►  POST /api/holidays/sync  ──►  holidays table
   (source of truth)                       (bearer-secret auth,           (service role)
                                            replaces all rows)
```

## 1. The sheet

One tab, header in row 1, columns **Date · Observed · Name · Emoji**. Fill
`Observed` only when a holiday's day off is moved (weekend → working day);
otherwise leave it blank. Keep dates as `YYYY-MM-DD`.

| Date | Observed | Name | Emoji |
|------|----------|------|-------|
| 2026-01-01 | | New Year | 🎉 |
| 2026-04-12 | 2026-04-13 | Orthodox Easter | ⛪ |
| 2026-05-01 | | International Workers' Day | 🌷 |
| 2026-05-08 | | Memorial Day | 🕯️ |
| 2026-05-31 | 2026-06-01 | Orthodox Trinity | ⛪ |
| 2026-06-28 | 2026-06-29 | Ukraine Constitution Day | 📜 |
| 2026-07-15 | | Day of Ukrainian Statehood | 🇺🇦 |
| 2026-08-24 | | Ukraine Independence Day | 🇺🇦 |
| 2026-10-01 | | Defender's Day of Ukraine | 🛡️ |
| 2026-12-25 | | Christmas | 🎄 |

## 2. App env vars (Vercel → Project → Settings → Environment Variables)

- `HOLIDAYS_SYNC_SECRET` — a shared secret. Generate one, e.g.
  `openssl rand -hex 32`. Used to authenticate the Apps Script.
- `SUPABASE_SERVICE_ROLE_KEY` — already set (used elsewhere); the sync writes
  with it. Confirm it's present.

Redeploy after adding the secret so the endpoint picks it up.

## 3. Apps Script (Extensions → Apps Script — paste, then configure)

```javascript
/**
 * Webfolks Dashboard — holiday sheet → app sync.
 * Pushes this sheet's rows to the dashboard so the Agency Events drawer mirrors
 * the sheet within seconds of an edit.
 *
 * Setup (one time):
 *  1. Extensions → Apps Script, paste this file, Save.
 *  2. Project Settings (gear) → Script Properties → add:
 *       SYNC_URL    = https://<your-app-domain>/api/holidays/sync
 *       SYNC_SECRET = <same value as HOLIDAYS_SYNC_SECRET in Vercel>
 *  3. Triggers (clock icon) → Add Trigger:
 *       a) function onSheetEdit · event: From spreadsheet · On edit
 *       b) function pushHolidays · event: Time-driven · Day timer (safety net)
 *  4. Run `pushHolidays` once and approve the authorization prompt.
 *
 * Sheet columns (row 1 = header): Date | Observed | Name | Emoji
 */

var HEADER_ROWS = 1;

function pushHolidays() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var tz = ss.getSpreadsheetTimeZone();
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROWS) return postRows([]);

  var values = sheet.getRange(HEADER_ROWS + 1, 1, lastRow - HEADER_ROWS, 4).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var date = formatDate(values[i][0], tz);
    var observed = formatDate(values[i][1], tz);
    var name = String(values[i][2] || '').trim();
    var emoji = String(values[i][3] || '').trim();
    if (!date || !name) continue;
    rows.push({ date: date, observed: observed || null, name: name, emoji: emoji || null });
  }
  return postRows(rows);
}

function formatDate(value, tz) {
  if (value instanceof Date) return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  var s = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function postRows(rows) {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('SYNC_URL');
  var secret = props.getProperty('SYNC_SECRET');
  if (!url || !secret) throw new Error('Set SYNC_URL and SYNC_SECRET in Script Properties.');

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + secret },
    payload: JSON.stringify({ rows: rows }),
    muteHttpExceptions: true,
  });
  Logger.log(res.getResponseCode() + ' ' + res.getContentText());
  return res.getContentText();
}

function onSheetEdit(e) {
  pushHolidays();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Dashboard')
    .addItem('Sync holidays now', 'pushHolidays')
    .addToUI();
}
```

Notes:
- The edit trigger **must be installable** (added via the Triggers UI, step 3a) —
  a simple `onEdit` can't make external requests. The menu item **Dashboard →
  Sync holidays now** is a manual force-push.
- The endpoint replaces all rows on each push and refuses an empty payload, so a
  bad edit can't blank the list.
- The dashboard renders per request, so a synced change shows on the next page
  load. (Live-updating an already-open tab would need Supabase Realtime — a
  future add-on.)
