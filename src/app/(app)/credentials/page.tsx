import type { Metadata } from "next";

import { CredentialsView } from "@/components/credentials/credentials-view";
import { getCurrentProfile } from "@/lib/auth/profile";

export const metadata: Metadata = {
  title: "Credentials",
};

export default async function CredentialsPage() {
  const profile = await getCurrentProfile();
  return <CredentialsView isAdmin={profile?.role === "admin"} />;
}
