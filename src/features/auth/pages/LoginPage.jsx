import { Link, Navigate, useLocation } from "react-router-dom";

import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? "/dashboard"} replace />;
  }

  return (
    <RoutePlaceholder
      eyebrow="Authentication"
      title="Login page scaffolded"
      description="Auth routing is in place. The actual form submission flow will land in Phase 1 using React Hook Form, Zod and the auth service already wired in this bootstrap."
      primaryAction={{ to: "/register", label: "Open register page" }}
      secondaryAction={{ to: "/", label: "Back to landing" }}
    >
      <div className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Next phase: wire `POST /auth/login`, persist access token in Zustand
          memory, then fetch `GET /auth/me`.
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
