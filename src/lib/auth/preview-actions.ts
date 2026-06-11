"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { ADMIN_PREVIEW_COOKIE, requireAdmin } from "@/lib/auth/profile";

/**
 * Toggles the admin "view as member" preview. Only real admins may set it; the
 * cookie merely hides admin-only UI (RLS still governs the data). Refreshes the
 * whole app tree so the sidebar and pages re-render with the new flag.
 */
export async function setAdminPreview(previewAsMember: boolean): Promise<void> {
  // Real-role check (requireAdmin uses the actual role, not the preview).
  await requireAdmin();

  const cookieStore = await cookies();
  if (previewAsMember) {
    cookieStore.set(ADMIN_PREVIEW_COOKIE, "member", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } else {
    cookieStore.delete(ADMIN_PREVIEW_COOKIE);
  }

  revalidatePath("/", "layout");
}
