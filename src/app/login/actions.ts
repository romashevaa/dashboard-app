"use server";

import { headers } from "next/headers";

import { isAllowedEmail } from "@/lib/auth/allowed-domain";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
};

/**
 * Requests a passwordless magic link for the given email.
 *
 * Enforces the corporate-domain allow-list before touching Supabase. The DB
 * `before-user-created` hook is the authoritative gate; this check keeps
 * non-allowed addresses from ever triggering an email.
 */
export async function signInWithMagicLink(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "Couldn't send the link. Try again in a moment.",
      email,
    };
  }

  return {
    status: "sent",
    message: `We sent a sign-in link to ${email}. Check your inbox.`,
    email,
  };
}
