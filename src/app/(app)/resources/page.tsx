import { BookOpen } from "lucide-react";

import { SectionPlaceholder } from "@/components/section-placeholder";

export default function ResourcesPage() {
  return (
    <SectionPlaceholder
      title="Resources"
      description="The resources and learning library."
      icon={BookOpen}
    />
  );
}
