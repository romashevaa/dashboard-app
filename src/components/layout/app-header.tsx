import { Button } from "@/components/ui/button";
import { MainNav } from "./main-nav";

export function AppHeader({
  email,
  isAdmin = false,
}: {
  email: string | null;
  isAdmin?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            W
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Webfolks
          </span>
        </div>

        <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
          <MainNav isAdmin={isAdmin} />
        </div>

        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden text-sm text-muted-foreground md:inline">
              {email}
            </span>
          ) : null}
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
