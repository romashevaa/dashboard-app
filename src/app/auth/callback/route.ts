import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { isAllowedEmail } from "@/lib/auth/allowed-domain";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing route. Supabase redirects here after the user clicks the
 * link in their email; we exchange the one-time code/token for a session
 * cookie and then forward into the app.
 *
 * Supports both the PKCE `?code=` flow and the `?token_hash=&type=` flow so
 * the route works regardless of the configured email template.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = sanitizeRedirect(searchParams.get("redirectTo"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return guardDomainAndRedirect(supabase, origin, redirectTo);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return guardDomainAndRedirect(supabase, origin, redirectTo);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

/**
 * Defense in depth: even after a valid token exchange, confirm the signed-in
 * address is on the corporate allow-list. The DB hook should prevent this,
 * but we sign out and bounce if anything slips through.
 */
async function guardDomainAndRedirect(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  redirectTo: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAllowedEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}

function sanitizeRedirect(value: string | null): string {
  // Only allow same-origin, absolute-path redirects to avoid open redirects.
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}
