"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEM, NAV_ITEMS } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// lucide-react dropped brand glyphs in v1, so the social marks are inlined.
type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function DribbbleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
    </svg>
  );
}

const SOCIALS: { label: string; href: string; icon: ComponentType<IconProps> }[] =
  [
    { label: "Instagram", href: "#", icon: InstagramIcon },
    { label: "LinkedIn", href: "#", icon: LinkedinIcon },
    { label: "Dribbble", href: "#", icon: DribbbleIcon },
    { label: "Website", href: "https://www.webfolks.io", icon: Globe },
  ];

export function Sidebar({
  isAdmin = false,
  className,
  onNavigate,
}: {
  isAdmin?: boolean;
  className?: string;
  /** Called when a nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside
      className={cn(
        "flex h-dvh w-64 shrink-0 flex-col justify-between gap-6 py-5",
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-5">
          <span className="grid size-6 place-items-center rounded-md bg-brand text-xs font-bold text-white">
            W
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            WebFolks
          </span>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-0.5 px-2.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-2.5 text-base font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {item.emoji}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 px-5">
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noreferrer"
            className="grid size-8 place-items-center rounded text-muted-foreground transition-colors hover:text-white"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <Icon className="size-4" aria-hidden />
          </a>
        ))}
      </div>
    </aside>
  );
}
