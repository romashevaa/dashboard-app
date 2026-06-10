import type { Metadata } from "next";

import { CredentialsView } from "@/components/credentials/credentials-view";

export const metadata: Metadata = {
  title: "Credentials",
};

export default function CredentialsPage() {
  return <CredentialsView />;
}
