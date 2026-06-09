import {
  BookOpen,
  CalendarDays,
  FileText,
  KeyRound,
  PenLine,
  Plane,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";

/**
 * Dashboard skeleton: a 3-column × 4-row grid that fills the panel, with 32px
 * (gap-8) gaps. Cards are headings only for now; content is added per feature.
 */
export default function OverviewPage() {
  return (
    <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-4">
      <DashboardCard
        title="Time off"
        icon={Plane}
        className="lg:col-span-2 lg:row-start-1"
      />
      <DashboardCard
        title="Agency events"
        icon={CalendarDays}
        className="lg:col-start-3 lg:row-start-1 lg:row-span-2"
      />
      <DashboardCard
        title="Agency onboarding"
        icon={FileText}
        className="lg:col-start-1 lg:row-start-2 lg:row-span-2"
      />
      <DashboardCard
        title="Credentials"
        icon={KeyRound}
        className="lg:col-start-2 lg:row-start-2 lg:row-span-2"
      />
      <DashboardCard
        title="Resources"
        icon={BookOpen}
        className="lg:col-start-3 lg:row-start-3 lg:row-span-2"
      />
      <DashboardCard
        title="Message templates"
        icon={PenLine}
        className="lg:col-span-2 lg:row-start-4"
      />
    </div>
  );
}
