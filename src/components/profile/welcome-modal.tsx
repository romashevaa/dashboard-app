"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import { dismissWelcome } from "@/app/(app)/profile/actions";

/**
 * First-login welcome. Shown once (server gates on `welcomed_at`); either
 * action marks the welcome as seen so it won't reappear. Closing it leaves the
 * red-dot nudge on the account button until the profile is filled in.
 */
export function WelcomeModal({
  open: initialOpen,
  firstName,
}: {
  open: boolean;
  firstName: string;
}) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  const close = () => {
    setOpen(false);
    void dismissWelcome();
  };

  // Navigate immediately for an instant reaction; mark the welcome seen in the
  // background (fire-and-forget, like `close`). The modal is already closed in
  // client state and the app layout stays mounted across navigation, so it
  // won't flash back open while `welcomed_at` commits.
  const goToProfile = () => {
    setOpen(false);
    void dismissWelcome();
    router.push("/profile");
  };

  return (
    <Modal open={open} onClose={close} className="max-w-sm">
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-primary/15 ring-1 ring-inset ring-primary/20">
          <EmojiIcon name="wave" size={40} />
        </span>

        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Welcome aboard{firstName ? `, ${firstName}` : ""}!
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You&apos;re now part of the Webfolks team hub. Add a few details —
            your name, role, and photo — so teammates can find and reach you.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 pt-1">
          <Button type="button" size="xl" onClick={goToProfile}>
            Set up my profile
          </Button>
          <Button type="button" variant="ghost" onClick={close}>
            Maybe later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
