import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";

export function AdminDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Admin"
      title="Admin dashboard route is gated and ready"
      description="Role-based access is now enforced at the router level. Admin data tables and charts can be built in Phase 5 without revisiting the auth guard."
    />
  );
}
