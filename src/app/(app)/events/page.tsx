import { CalendarDays } from "lucide-react";

import { SectionPlaceholder } from "@/components/section-placeholder";

export default function EventsPage() {
  return (
    <SectionPlaceholder
      title="Events"
      description="Events and holidays calendar."
      icon={CalendarDays}
    />
  );
}
