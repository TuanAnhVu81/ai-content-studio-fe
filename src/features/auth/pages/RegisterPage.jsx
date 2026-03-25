import { Navigate } from "react-router-dom";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Authentication
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            Register with your work email to start managing campaigns and AI content
            inside one workspace.
          </p>
        </div>
      </div>

      <RegisterForm />
    </section>
  );
}
