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
  const redirectTo = sanitizeRedirect(String(formData.get("redirectTo") ?? "/"));

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
      emailRedirectTo: `${origin}/auth/callback?redirectTo=${encodeURIComponent(
        redirectTo
      )}`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Couldn't send the email. Try again in a moment.",
      email,
    };
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

  if (!/^\d{6}$/.test(token)) {
    return { error: "Enter the 6-digit code from your email." };
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
