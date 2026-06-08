import type { Metadata } from "next";
import { Shield } from "lucide-react";

import { requireAdmin } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";
import { RoleForm } from "./role-form";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const profiles = (data as Profile[] | null) ?? [];

  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <Shield className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            User management
          </h1>
          <p className="text-sm text-muted-foreground">
            Assign roles to team members. Changes are gated by row-level
            security.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Current role</th>
              <th className="px-4 py-3 font-medium">Assign role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const isSelf = profile.id === admin.id;
              return (
                <tr key={profile.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {profile.full_name ?? profile.email}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      ) : null}
                    </div>
                    {profile.full_name ? (
                      <div className="text-xs text-muted-foreground">
                        {profile.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {profile.role}
                  </td>
                  <td className="px-4 py-3">
                    <RoleForm
                      userId={profile.id}
                      currentRole={profile.role}
                      isSelf={isSelf}
                    />
                  </td>
                </tr>
              );
            })}
            {profiles.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No users yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
