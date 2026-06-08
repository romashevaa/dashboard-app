import Link from "next/link";

import { NAV_ITEMS } from "@/lib/nav";

export default function OverviewPage() {
  const sections = NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight">
          Welcome to the Webfolks Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your team hub — directory, credentials, resources, and more, all in
          one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
          >
            <span className="text-2xl leading-none" aria-hidden>
              {item.emoji}
            </span>
            <div>
              <h2 className="text-sm font-medium text-foreground">
                {item.label}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Coming soon
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
