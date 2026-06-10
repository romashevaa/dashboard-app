"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  requestSignIn,
  verifySignIn,
  type RequestState,
  type VerifyState,
} from "./actions";

const requestInit: RequestState = { status: "idle" };
const verifyInit: VerifyState = {};

// text-base (16px) on mobile keeps iOS/Android from zooming on focus.
const inputClass =
  "h-11 rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-10 md:text-sm";

const linkButtonClass =
  "text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50";

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
  // Derived (no effect) so the form still submits as a plain server action
  // without client JS: once a *different* email is (re)sent, the code step
  // shows again because reqState.email no longer matches.
  const [editedEmail, setEditedEmail] = useState<string | null>(null);

  const showCodeStep =
    reqState.status === "sent" && reqState.email !== editedEmail;

  // Step 2: code entry (the email also contains a clickable magic link).
  if (showCodeStep) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
        >
          We emailed a sign-in link and a 6-digit code to{" "}
          <span className="text-foreground">{reqState.email}</span>. Enter the
          code below, or just click the link in the email.
        </p>

        <form action={verifyAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={reqState.email} />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="flex flex-col gap-2">
            <label htmlFor="token" className="text-sm font-medium">
              6-digit code
            </label>
            <input
              id="token"
              name="token"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
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
            {verPending ? "Verifying…" : "Verify code"}
          </Button>
        </form>

        <div className="flex items-center justify-between">
          {/* Resend re-runs the request action with the same email. */}
          <form action={requestAction}>
            <input type="hidden" name="email" value={reqState.email} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button type="submit" className={linkButtonClass} disabled={reqPending}>
              {reqPending ? "Resending…" : "Resend code"}
            </button>
          </form>

          <button
            type="button"
            className={linkButtonClass}
            onClick={() => setEditedEmail(reqState.email ?? null)}
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
        {reqPending ? "Sending…" : "Email me a link & code"}
      </Button>
    </form>
  );
}
