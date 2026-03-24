import { Link, Navigate } from "react-router-dom";

import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <RoutePlaceholder
      eyebrow="Authentication"
      title="Register page scaffolded"
      description="The app shell is ready for a full registration flow. Validation and API integration are deferred to Phase 1, but this route, layout and navigation contract are already in place."
      primaryAction={{ to: "/login", label: "Open login page" }}
      secondaryAction={{ to: "/", label: "Back to landing" }}
    >
      <div className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Next phase: wire `POST /auth/register` and auto-login after account
          creation.
        </p>
        <div className="mt-4">
          <Link to="/" className={buttonVariants({ variant: "outline" })}>
            Return home
          </Link>
        </div>
      </div>
    </RoutePlaceholder>
  );
}
