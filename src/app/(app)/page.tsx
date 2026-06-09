import { CredentialsCard } from "@/components/dashboard/credentials-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

/**
 * Dashboard skeleton, laid out on a 3-column × 10-row grid (each row = 10% of
 * the panel height) so areas can use 40/60 height splits, with 32px (gap-8)
 * gaps:
 *
 *   col 1: Time off (40%, spans cols 1-2)  | Agency onboarding (60%)
 *   col 2: Time off (40%)                  | Credentials (30%) + Templates (30%)
 *   col 3: Agency events (60%)             | Resources (40%)
 *
 * Cards are headings only for now; content is added per feature.
 */
export default function OverviewPage() {
  return (
    <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-[repeat(10,minmax(0,1fr))]">
      <DashboardCard
        title="Time off"
        icon="palmtree"
        className="lg:col-span-2 lg:row-span-[4]"
      />
      <DashboardCard
        title="Agency events"
        icon="calendar"
        className="lg:col-start-3 lg:row-start-1 lg:row-span-[6]"
      />
      <DashboardCard
        title="Agency onboarding"
        icon="page"
        className="lg:col-start-1 lg:row-start-[5] lg:row-span-[6]"
      />
      <CredentialsCard className="lg:col-start-2 lg:row-start-[5] lg:row-span-[3]" />
      <DashboardCard
        title="Message templates"
        icon="writing-hand"
        className="lg:col-start-2 lg:row-start-[8] lg:row-span-[3]"
      />
      <DashboardCard
        title="Resources"
        icon="unicorn"
        className="lg:col-start-3 lg:row-start-[7] lg:row-span-[4]"
      />
    </div>
  );
}
