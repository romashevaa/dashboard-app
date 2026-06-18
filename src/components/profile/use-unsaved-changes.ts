"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Warns before leaving with unsaved changes. While `dirty`:
 *  - hard navigation (refresh / tab close / external) triggers the browser's
 *    native "Leave site?" prompt;
 *  - in-app navigation via a link is intercepted so the caller can show a
 *    confirm dialog (returns the pending href + confirm/cancel handlers).
 */
export function useUnsavedChanges(dirty: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || anchor?.getAttribute("target") === "_blank") return;
      // Only guard internal, same-document route changes.
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
      if (href === window.location.pathname) return;
      e.preventDefault();
      setPendingHref(href);
    };
    // Capture phase so we intercept before Next's Link handler runs.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  return {
    pendingHref,
    confirmLeave: () => {
      const href = pendingHref;
      setPendingHref(null);
      if (href) router.push(href);
    },
    cancelLeave: () => setPendingHref(null),
  };
}
