import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/db/database.types";

/**
 * Public routes that do NOT require an authenticated session.
 * Everything else is auth-gated (see CLAUDE.md: "No public pages beyond the
 * login screen").
 */
const PUBLIC_PATHS = [
  "/login",
  "/auth",
  // Machine-to-machine endpoint with its own bearer-secret auth (the holiday
  // sheet's Apps Script has no session) — it must not be bounced to /login.
  "/api/holidays/sync",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Refreshes the Supabase auth session on every request and enforces the
 * route gate. RLS remains the primary access guard — this middleware is for
 * UX (redirecting unauthenticated users to the login screen).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and getUser(). A
  // simple mistake could make it hard to debug random user logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated users hitting a protected route → bounce to /login.
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users hitting /login → send them into the app.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return the supabaseResponse object as-is to keep cookies in
  // sync between the browser and the server.
  return supabaseResponse;
}
