"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { setAvatar } from "@/app/(app)/profile/actions";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (matches the bucket limit)

/**
 * Avatar with photo upload. The file goes straight to Supabase Storage from the
 * browser (RLS scopes writes to the user's own folder); we then record the
 * public URL via a server action so the header/profile update everywhere.
 */
export function AvatarUpload({
  userId,
  name,
  src,
}: {
  userId: string;
  name: string;
  src: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 2 MB.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      // Stable-ish name + cache-busting timestamp; scoped to the user's folder.
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setError("Upload failed. Try again.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      await setAvatar(publicUrl);
      router.refresh();
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      await setAvatar(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <UserAvatar name={name} src={src} className="size-24 text-2xl" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          aria-label="Change photo"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-surface bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Camera className="size-4" aria-hidden />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline disabled:opacity-60"
        >
          {pending ? "Uploading…" : src ? "Change photo" : "Upload photo"}
        </button>
        {src ? (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-destructive hover:underline disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onPick(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
    </div>
  );
}
