import { KeyRound } from "lucide-react";

import { SectionPlaceholder } from "@/components/section-placeholder";

export default function CredentialsPage() {
  return (
    <SectionPlaceholder
      title="Credentials"
      description="Shared tool credentials."
      icon={KeyRound}
    />
  );
}
