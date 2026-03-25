import { Navigate, useLocation } from "react-router-dom";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? "/dashboard"} replace />;
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Authentication
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Sign in with your email and password to access your dashboard,
            campaigns and editor workspace.
          </p>
        </div>
      </div>

      <LoginForm redirectTo={location.state?.from?.pathname ?? "/dashboard"} />
    </section>
  );
}
