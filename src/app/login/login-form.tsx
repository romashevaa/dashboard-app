"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  requestSignIn,
  verifySignIn,
  type RequestState,
  type VerifyState,
} from "./actions";

const requestInit: RequestState = { status: "idle" };
const verifyInit: VerifyState = {};

// Remember the pending sign-in across reloads so a refresh doesn't kick the
// user back to the email step (the emailed code stays valid server-side).
const STORAGE_KEY = "wf_signin";
const OTP_TTL_MS = 60 * 60 * 1000; // codes are valid ~1h
const RESEND_MS = 30 * 1000; // min gap between code requests

type Pending = { email: string; sentAt: number };

function loadPending(): Pending | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Pending;
    if (p?.email && p?.sentAt && Date.now() - p.sentAt < OTP_TTL_MS) return p;
  } catch {
    /* ignore */
  }
  localStorage.removeItem(STORAGE_KEY);
  return null;
}

// text-base (16px) on mobile keeps iOS/Android from zooming on focus.
const inputClass =
  "h-11 rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-10 md:text-sm";

const linkButtonClass =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50 disabled:no-underline";

export function LoginForm({ redirectTo = "/" }: { redirectTo?: string }) {
  const [reqState, requestAction, reqPending] = useActionState(
    requestSignIn,
    requestInit
  );
  const [verState, verifyAction, verPending] = useActionState(
    verifySignIn,
    verifyInit
  );
  // Tracks the address the user chose to "edit away from" on the code step.
  const [editedEmail, setEditedEmail] = useState<string | null>(null);
  // Pending email + last-sent time, restored from storage on mount.
  const [pending, setPending] = useState<Pending | null>(null);
  // A ticking clock to drive the resend countdown.
  const [now, setNow] = useState(() => Date.now());

  // Restore any pending sign-in on mount (reads localStorage, a platform API).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from storage
    setPending(loadPending());
  }, []);

  // Persist the email once a code has actually been sent.
  useEffect(() => {
    if (reqState.status === "sent" && reqState.email) {
      const next = { email: reqState.email, sentAt: Date.now() };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync to localStorage on send
      setPending(next);
      // Reset the countdown base so it reads 30s immediately (not a stale value).
      setNow(next.sentAt);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, [reqState.status, reqState.email]);

  // A code is only actually pending after a SUCCESSFUL send (status "sent") or
  // a restored session — never after an errored request (e.g. a wrong-domain
  // address), which still carries reqState.email.
  const sentEmail = reqState.status === "sent" ? (reqState.email ?? null) : null;
  const email = sentEmail ?? pending?.email ?? null;
  const sentAt = pending?.sentAt ?? null;
  const secondsLeft = sentAt
    ? Math.max(0, Math.ceil((sentAt + RESEND_MS - now) / 1000))
    : 0;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const showCodeStep = Boolean(email) && email !== editedEmail;

  function forgetPending() {
    setEditedEmail(email);
    setPending(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  // Restart the cooldown the instant a resend is submitted. The persist effect
  // above only fires on a status *transition*, so a repeat send (status stays
  // "sent") wouldn't reset it — stamp it here, with `now` in sync.
  function stampResend() {
    if (!email) return;
    const next = { email, sentAt: Date.now() };
    setPending(next);
    setNow(next.sentAt);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  // Step 2: code entry (the email also contains a clickable magic link).
  if (showCodeStep) {
    const resendDisabled = reqPending || secondsLeft > 0;
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm text-muted-foreground">
          Check <span className="text-foreground">{email}</span> — enter the
          code, or open the link in the email.
        </p>

        <form action={verifyAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={email ?? ""} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="flex flex-col gap-2">
            <label htmlFor="token" className="text-sm font-medium">
              Code
            </label>
            <input
              id="token"
              name="token"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={8}
              minLength={6}
              required
              autoFocus
              placeholder="123456"
              className={`${inputClass} text-center tracking-[0.5em]`}
            />
          </div>

          {verState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {verState.error}
            </p>
          ) : null}

          <Button type="submit" size="xl" disabled={verPending}>
            {verPending ? "Verifying…" : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between">
          {/* Resend re-runs the request action with the same email. */}
          <form action={requestAction} onSubmit={stampResend}>
            <input type="hidden" name="email" value={email ?? ""} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className={linkButtonClass}
              disabled={resendDisabled}
            >
              {reqPending
                ? "Resending…"
                : secondsLeft > 0
                  ? `Resend code in ${secondsLeft}s`
                  : "Resend code"}
            </button>
          </form>

          <button
            type="button"
            className={linkButtonClass}
            onClick={forgetPending}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // Step 1: email entry.
  return (
    <form action={requestAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={reqState.email}
          placeholder="you@webfolks.io"
          className={inputClass}
        />
      </div>

      {reqState.status === "error" && reqState.message ? (
        <p className="text-sm text-destructive" role="alert">
          {reqState.message}
        </p>
      ) : null}

      <Button type="submit" size="xl" disabled={reqPending}>
        {reqPending ? "Sending…" : "Send me a code"}
      </Button>
    </form>
  );
}
