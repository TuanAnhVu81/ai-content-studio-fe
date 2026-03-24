import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";

export function UserDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Dashboard"
      title="User dashboard is ready for data wiring"
      description="Protected routing, main layout and state providers are active. Phase 2 can attach the dashboard query and render stats, recent activity and token usage without revisiting the app shell."
    />
  );
}
