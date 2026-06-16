"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAllowedEmail } from "@/lib/auth/allowed-domain";
import { createClient } from "@/lib/supabase/server";

export type RequestState = {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
};

export type VerifyState = {
  error?: string;
};

/**
 * Whether the visitor now has a session. Polled by the login screen so that if
 * the user opens the magic link in another tab (the session cookie is shared),
 * the original tab auto-advances into the app instead of being left behind.
 */
export async function checkSignedIn(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

/** Only allow same-origin, absolute-path redirects (no open redirects). */
function sanitizeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

/**
 * Requests a passwordless sign-in email. Supabase sends both a magic link and
 * a 6-digit code (the email template renders both) — the user can use either.
 *
 * Enforces the corporate-domain allow-list before touching Supabase.
 */
export async function requestSignIn(
  _prevState: RequestState,
  formData: FormData
): Promise<RequestState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Enter your work email address." };
  }

  if (!isAllowedEmail(email)) {
    return {
      status: "error",
      message: "Use your Webfolks email address to sign in.",
      email,
    };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Must match an allowed redirect URL exactly (no extra query string),
      // otherwise Supabase falls back to the site URL and the code is never
      // exchanged. The code-entry path below still honors redirectTo.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    // Full detail server-side only (Vercel function logs) — the login page is
    // public, so don't echo raw SMTP/provider errors to it.
    console.error(
      "[auth] signInWithOtp failed:",
      error.status,
      error.code,
      error.message
    );
    const message =
      error.code === "over_email_send_rate_limit"
        ? "Too many sign-in emails requested — wait a minute and try again."
        : error.status && error.status >= 500
          ? "Email delivery failed on the server — likely the SMTP settings. Check the Supabase auth logs."
          : "Couldn't send the email. Try again in a moment.";
    return { status: "error", message, email };
  }

  return { status: "sent", email };
}

/**
 * Verifies the 6-digit code from the sign-in email and establishes the session.
 * On success, redirects into the app.
 */
export async function verifySignIn(
  _prevState: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const redirectTo = sanitizeRedirect(String(formData.get("redirectTo") ?? "/"));

  // Defense in depth: only allowed domains ever receive a code, but re-check
  // here too (the DB before-user-created hook remains the authoritative gate).
  if (!isAllowedEmail(email)) {
    return { error: "Use your Webfolks email address to sign in." };
  }

  if (!/^\d{6,8}$/.test(token)) {
    return { error: "Enter the code from your email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: "That code is invalid or expired. Request a new one." };
  }

  redirect(redirectTo);
}
