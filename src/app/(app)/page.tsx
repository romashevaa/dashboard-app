import Link from "next/link";

import { NAV_ITEMS } from "@/lib/nav";

export default function OverviewPage() {
  const sections = NAV_ITEMS.filter((item) => item.href !== "/");

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to the Webfolks Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your team hub — directory, credentials, resources, and more, all in
          one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-background p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-medium">{item.label}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
