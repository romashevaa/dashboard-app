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

  // Mark the welcome seen first, then navigate — so the profile page doesn't
  // briefly re-open this modal before welcomed_at is committed.
  const goToProfile = async () => {
    setOpen(false);
    await dismissWelcome();
    router.push("/profile");
  };

  return (
    <Modal open={open} onClose={close} title="Welcome to the team">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.08]">
            <EmojiIcon name="wave" size={22} />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Hi {firstName}, glad you&apos;re here! Take a minute to tell the team
            a bit about yourself — your name, role, and how to reach you. It
            shows up in the member directory.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={close}>
            Maybe later
          </Button>
          <Button type="button" onClick={goToProfile}>
            Fill in my profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
