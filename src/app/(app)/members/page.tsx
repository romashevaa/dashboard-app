import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MembersDirectory } from "@/components/members/members-directory";
import type { Member } from "@/components/members/member-card";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, role, position, birthdate, phone, telegram, linkedin, dribbble, behance"
    )
    .order("full_name", { ascending: true, nullsFirst: false });

  const members = (data ?? []) as Member[];

  return <MembersDirectory members={members} />;
}
