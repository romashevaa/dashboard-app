import { CredentialsCard } from "@/components/dashboard/credentials-card";
import { EventsCard } from "@/components/dashboard/events-card";
import { LeaveCard } from "@/components/dashboard/leave-card";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { ResourcesCard } from "@/components/dashboard/resources-card";
import { TemplatesCard } from "@/components/dashboard/templates-card";

export default function OverviewPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <LeaveCard className="md:col-span-2" />
      <EventsCard className="lg:col-start-3 lg:row-span-2" />
      <OnboardingCard />
      <CredentialsCard />
      <TemplatesCard className="lg:col-start-2 lg:row-start-3" />
      <ResourcesCard className="lg:col-start-3 lg:row-start-3" />
    </div>
  );
}
