import { CredentialsCard } from "@/components/dashboard/credentials-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { TemplatesCard } from "@/components/dashboard/templates-card";
import { AgencyEventsCard } from "@/components/events/agency-events-card";
import { getAgencyEvents } from "@/lib/events/agency-events";

/**
 * Dashboard. Responsive:
 *   - base:  single column, compact cards (icon + title + subtitle)
 *   - md:    two columns
 *   - lg:    the Figma 3-column × 10-row layout, where cards reveal their
 *            visuals and use 40/60 height splits.
 *
 * The Credentials + Templates pair uses `display: contents` below lg so each
 * flows as its own card, then groups into the center column at lg.
 */
export default async function OverviewPage() {
  const { holidays, birthdays, today, previousHoliday, nextHoliday } =
    await getAgencyEvents();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:h-full lg:grid-cols-3 lg:grid-rows-[repeat(10,minmax(0,1fr))] lg:gap-8">
      <DashboardCard
        title="Time off"
        subtitle="Days off, sick leave & vacation"
        icon="palmtree"
        href="/events"
        className="lg:col-span-2 lg:row-span-[4]"
      />
      <AgencyEventsCard
        holidays={holidays}
        birthdays={birthdays}
        today={today}
        previousHoliday={previousHoliday}
        nextHoliday={nextHoliday}
        className="lg:col-start-3 lg:row-start-1 lg:row-span-[6]"
      />
      <DashboardCard
        title="Agency onboarding"
        subtitle="Salary, time tracking & more"
        icon="page"
        href="/links"
        className="lg:col-start-1 lg:row-start-[5] lg:row-span-[6]"
      />

      <div className="contents lg:col-start-2 lg:row-start-[5] lg:row-span-[6] lg:flex lg:flex-col lg:gap-8">
        <CredentialsCard className="lg:min-h-0 lg:flex-1" />
        <TemplatesCard />
      </div>

      <DashboardCard
        title="Resources"
        subtitle="Tools & learning library"
        icon="unicorn"
        href="/resources"
        className="lg:col-start-3 lg:row-start-[7] lg:row-span-[4]"
      />
    </div>
  );
}
