import type { Metadata } from "next";

import { CredentialsView } from "@/components/credentials/credentials-view";
import { getViewerContext } from "@/lib/auth/profile";
import { getCredentials } from "@/lib/credentials/data";

export const metadata: Metadata = {
  title: "Credentials",
};

export default async function CredentialsPage() {
  const [{ isAdmin }, records] = await Promise.all([
    getViewerContext(),
    getCredentials(),
  ]);

  return <CredentialsView records={records} isAdmin={isAdmin} />;
}
