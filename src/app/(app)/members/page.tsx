import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { MemberCard, type Member } from "@/components/members/member-card";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, avatar_url, role, position, phone, telegram, hire_date"
    )
    .order("full_name", { ascending: true, nullsFirst: false });

  const members = (data ?? []) as Member[];

  return (
    <section className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {members.length} {members.length === 1 ? "person" : "people"} on the team
      </p>

      {members.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-muted-foreground">
          No one has signed in yet.
        </p>
      )}
    </section>
  );
}
