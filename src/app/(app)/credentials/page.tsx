import type { Metadata } from "next";

import { CredentialsView } from "@/components/credentials/credentials-view";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getCredentials } from "@/lib/credentials/data";

export const metadata: Metadata = {
  title: "Credentials",
};

export default async function CredentialsPage() {
  const [profile, records] = await Promise.all([
    getCurrentProfile(),
    getCredentials(),
  ]);

  return (
    <CredentialsView records={records} isAdmin={profile?.role === "admin"} />
  );
}
