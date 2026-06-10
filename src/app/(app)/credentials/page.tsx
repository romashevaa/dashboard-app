import type { Metadata } from "next";

import { EmojiIcon } from "@/components/ui/emoji-icon";
import { CredentialsView } from "@/components/credentials/credentials-view";

export const metadata: Metadata = {
  title: "Credentials",
};

export default function CredentialsPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
        <EmojiIcon name="lock" size={24} />
        Credentials
      </h1>
      <CredentialsView />
    </section>
  );
}
