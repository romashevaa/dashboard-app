import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MembersDirectory } from "@/components/members/members-directory";
import type { Member } from "@/components/members/member-card";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, role, position, birthdate, phone, telegram, linkedin, dribbble, behance"
    )
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) {
    // Usually a not-yet-applied migration (missing column).
    console.error("[members] load failed:", error.message);
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Couldn&apos;t load members. A database migration may be pending.
      </p>
    );
  }

  const members = (data ?? []) as Member[];

  return <MembersDirectory members={members} />;
}
